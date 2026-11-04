import { PublicKey } from "@solana/web3.js";
import { withSolanaRpc } from "../solana/connection";
import type { PresaleLedger } from "./ledger";
import {
  readPresaleFromMessage,
  type CompiledInstructionView,
  type PresaleSale,
} from "./protocol";

interface SignaturePageEntry {
  signature: string;
  err: unknown;
  slot: number | null;
  blockTime: number | null;
}

const NEW_TIP_PAGE_LIMIT = 4;
const HISTORY_PAGE_LIMIT = 2;
const PAGE_SIZE = 40;

function messageParts(message: {
  staticAccountKeys?: PublicKey[];
  accountKeys?: PublicKey[];
  compiledInstructions?: CompiledInstructionView[];
  instructions?: CompiledInstructionView[];
  header?: { numRequiredSignatures?: number };
}): { accountKeys: PublicKey[]; instructions: CompiledInstructionView[]; numSigners: number } {
  const accountKeys = message.staticAccountKeys ?? message.accountKeys;
  const instructions = message.compiledInstructions ?? message.instructions;
  if (!accountKeys || !instructions) {
    throw new Error("Transaction message could not be read");
  }
  return {
    accountKeys,
    instructions,
    numSigners: message.header?.numRequiredSignatures ?? 1,
  };
}

export function readPresaleFromRpcTransaction(
  tx: {
    slot?: number;
    blockTime?: number | null;
    meta: { err: unknown } | null;
    transaction: {
      message: {
        staticAccountKeys?: PublicKey[];
        accountKeys?: PublicKey[];
        compiledInstructions?: CompiledInstructionView[];
        instructions?: CompiledInstructionView[];
        header?: { numRequiredSignatures?: number };
      };
    };
  },
  signature: string,
  vault: string
): PresaleSale {
  if (!tx.meta) throw new Error("Transaction metadata is missing");
  const parts = messageParts(tx.transaction.message);
  return readPresaleFromMessage({
    signature,
    vault,
    err: tx.meta.err,
    slot: tx.slot ?? null,
    blockTime: tx.blockTime ?? null,
    ...parts,
  });
}

async function inspectSignature(
  connection: {
    getTransaction: (signature: string, config: { commitment: "confirmed"; maxSupportedTransactionVersion: 0 }) => Promise<Parameters<typeof readPresaleFromRpcTransaction>[0] | null>;
  },
  entry: SignaturePageEntry,
  vault: string
): Promise<PresaleSale | null> {
  if (entry.err) return null;
  const tx = await connection.getTransaction(entry.signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  if (!tx) return null;
  try {
    return readPresaleFromRpcTransaction(tx, entry.signature, vault);
  } catch {
    return null;
  }
}

async function mapInBatches(
  entries: SignaturePageEntry[],
  vault: string,
  connection: Parameters<typeof inspectSignature>[0]
): Promise<PresaleSale[]> {
  const sales: PresaleSale[] = [];
  for (let index = 0; index < entries.length; index += 5) {
    const batch = entries.slice(index, index + 5);
    const found = await Promise.all(batch.map((entry) => inspectSignature(connection, entry, vault)));
    for (const sale of found) {
      if (sale) sales.push(sale);
    }
  }
  return sales;
}

/**
 * Pulls presale seats from the treasury address.
 * The JSON file is only a cache: a fresh container rebuilds it from these signatures.
 */
export async function syncPresaleFromChain(ledger: PresaleLedger): Promise<{
  sales: PresaleSale[];
  newestScanned: string | null;
  oldestScanned: string | null;
  historyComplete: boolean;
}> {
  const vaultKey = new PublicKey(ledger.vault);
  return withSolanaRpc(async (connection) => {
    const discovered: PresaleSale[] = [];
    let newestScanned = ledger.newestScanned;
    let oldestScanned = ledger.oldestScanned;
    let historyComplete = ledger.historyComplete;

    let before: string | undefined;
    let caughtUp = false;
    for (let page = 0; page < NEW_TIP_PAGE_LIMIT && !caughtUp; page += 1) {
      const signatures = await connection.getSignaturesForAddress(vaultKey, {
        limit: PAGE_SIZE,
        before,
      });
      if (signatures.length === 0) {
        historyComplete = true;
        break;
      }
      if (page === 0) newestScanned = signatures[0].signature;

      const unseen: SignaturePageEntry[] = [];
      for (const signature of signatures) {
        if (ledger.newestScanned && signature.signature === ledger.newestScanned) {
          caughtUp = true;
          break;
        }
        unseen.push({
          signature: signature.signature,
          err: signature.err,
          slot: signature.slot,
          blockTime: signature.blockTime ?? null,
        });
      }
      discovered.push(...(await mapInBatches(unseen, ledger.vault, connection)));
      const last = signatures[signatures.length - 1].signature;
      before = last;
      if (!caughtUp) oldestScanned = last;
      if (signatures.length < PAGE_SIZE) {
        historyComplete = true;
        caughtUp = true;
      }
    }

    if (!historyComplete && oldestScanned) {
      let historyBefore = oldestScanned;
      for (let page = 0; page < HISTORY_PAGE_LIMIT && !historyComplete; page += 1) {
        const signatures = await connection.getSignaturesForAddress(vaultKey, {
          limit: PAGE_SIZE,
          before: historyBefore,
        });
        if (signatures.length === 0) {
          historyComplete = true;
          break;
        }
        const entries = signatures.map((signature) => ({
          signature: signature.signature,
          err: signature.err,
          slot: signature.slot,
          blockTime: signature.blockTime ?? null,
        }));
        discovered.push(...(await mapInBatches(entries, ledger.vault, connection)));
        historyBefore = signatures[signatures.length - 1].signature;
        oldestScanned = historyBefore;
        if (signatures.length < PAGE_SIZE) historyComplete = true;
      }
    }

    return { sales: discovered, newestScanned, oldestScanned, historyComplete };
  });
}

export async function fetchPresaleTransaction(signature: string, vault: string): Promise<PresaleSale> {
  return withSolanaRpc(async (connection) => {
    const tx = await connection.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    if (!tx) throw new Error("Transaction is not on chain yet");
    return readPresaleFromRpcTransaction(tx, signature, vault);
  });
}
