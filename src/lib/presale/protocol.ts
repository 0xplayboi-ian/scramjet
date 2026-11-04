import bs58 from "bs58";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { DEFAULT_PLATFORM_FEE_VAULT } from "../constants";

/** On-chain tag that marks a direct treasury payment as a SCRAM presale seat. */
export const PRESALE_MEMO_TAG = "SCRAMJET:PRESALE:v1";

export const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

const SYSTEM_PROGRAM_ID = SystemProgram.programId.toBase58();
const COMPUTE_BUDGET_PROGRAM_ID = "ComputeBudget111111111111111111111111111111";
const SYSTEM_TRANSFER_DISCRIMINATOR = 2;

/** Smallest seat. Dust transfers are not presale buys. */
export const PRESALE_MIN_LAMPORTS = Math.round(0.05 * LAMPORTS_PER_SOL);

export const PRESALE_MAX_LAMPORTS = 10_000 * LAMPORTS_PER_SOL;

export interface PresaleSale {
  signature: string;
  buyer: string;
  lamports: number;
  slot: number | null;
  blockTime: number | null;
}

export interface CompiledInstructionView {
  programIdIndex: number;
  accountKeyIndexes?: number[];
  accounts?: number[];
  data: Uint8Array | number[] | string;
}

/**
 * Treasury that receives 100% of the presale SOL.
 * `NEXT_PUBLIC_SCRAMJET_FEE_VAULT` overrides the built-in vault when set.
 */
export function presaleVaultAddress(): string {
  const configured = process.env.NEXT_PUBLIC_SCRAMJET_FEE_VAULT?.trim();
  return configured || DEFAULT_PLATFORM_FEE_VAULT.toBase58();
}

export function presaleVaultPublicKey(): PublicKey {
  return new PublicKey(presaleVaultAddress());
}

export function solToLamports(amount: string): number {
  const trimmed = amount.trim();
  if (!/^\d+(\.\d{1,9})?$/.test(trimmed)) {
    throw new Error("Enter a SOL amount with up to 9 decimal places");
  }
  const [whole, fraction = ""] = trimmed.split(".");
  const lamports = BigInt(whole) * BigInt(LAMPORTS_PER_SOL) + BigInt(fraction.padEnd(9, "0"));
  if (lamports <= 0n) throw new Error("Enter a SOL amount");
  if (lamports > BigInt(PRESALE_MAX_LAMPORTS)) throw new Error("Amount is above the 10000 SOL presale cap");
  if (lamports < BigInt(PRESALE_MIN_LAMPORTS)) {
    throw new Error("Minimum presale is 0.05 SOL");
  }
  return Number(lamports);
}

export function formatSol(lamports: number): string {
  const whole = Math.floor(lamports / LAMPORTS_PER_SOL);
  const fraction = String(lamports % LAMPORTS_PER_SOL).padStart(9, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : String(whole);
}

/**
 * A presale payment is only a system transfer to the treasury plus the seat memo.
 * There is no protocol-fee instruction.
 */
export function buildPresaleInstructions(
  buyer: PublicKey,
  lamports: number,
  vault: PublicKey = presaleVaultPublicKey()
): TransactionInstruction[] {
  if (!Number.isInteger(lamports) || lamports < PRESALE_MIN_LAMPORTS || lamports > PRESALE_MAX_LAMPORTS) {
    throw new Error("Presale amount is outside the allowed range");
  }
  if (buyer.equals(vault)) {
    throw new Error("The treasury wallet cannot buy its own presale");
  }

  return [
    SystemProgram.transfer({
      fromPubkey: buyer,
      toPubkey: vault,
      lamports,
    }),
    new TransactionInstruction({
      programId: MEMO_PROGRAM_ID,
      keys: [{ pubkey: buyer, isSigner: true, isWritable: false }],
      data: Buffer.from(PRESALE_MEMO_TAG, "utf8"),
    }),
  ];
}

function accountIndexes(ix: CompiledInstructionView): number[] {
  return ix.accountKeyIndexes ?? ix.accounts ?? [];
}

function asBytes(data: Uint8Array | number[] | string): Uint8Array {
  if (typeof data === "string") return Uint8Array.from(bs58.decode(data));
  return data instanceof Uint8Array ? data : Uint8Array.from(data);
}

function readTransferLamports(data: Uint8Array): bigint {
  if (data.length < 12) throw new Error("System instruction is not a transfer");
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  if (view.getUint32(0, true) !== SYSTEM_TRANSFER_DISCRIMINATOR) {
    throw new Error("System instruction is not a transfer");
  }
  return view.getBigUint64(4, true);
}

/**
 * Reads a confirmed transaction and returns the presale seat.
 * Rejects failed transactions, missing memos, and any SOL that does not land on the treasury.
 */
export function readPresaleFromMessage(input: {
  signature: string;
  vault: string;
  err: unknown;
  slot?: number | null;
  blockTime?: number | null;
  accountKeys: PublicKey[];
  numSigners: number;
  instructions: CompiledInstructionView[];
}): PresaleSale {
  if (input.err) throw new Error("Transaction failed on chain");
  if (!input.signature) throw new Error("Missing transaction signature");

  let vaultKey: PublicKey;
  try {
    vaultKey = new PublicKey(input.vault);
  } catch {
    throw new Error("Treasury address is invalid");
  }

  const signers = new Set(
    input.accountKeys.slice(0, input.numSigners).map((key) => key.toBase58())
  );

  let memoOk = false;
  let buyer: string | null = null;
  let lamports = 0n;
  let vaultTransfers = 0;

  for (const ix of input.instructions) {
    const programKey = input.accountKeys[ix.programIdIndex];
    if (!programKey) throw new Error("Instruction program is missing");
    const programId = programKey.toBase58();
    const indexes = accountIndexes(ix);
    const data = asBytes(ix.data);

    if (programId === COMPUTE_BUDGET_PROGRAM_ID) continue;

    if (programId === MEMO_PROGRAM_ID.toBase58()) {
      const text = new TextDecoder().decode(data).trim();
      if (text === PRESALE_MEMO_TAG) memoOk = true;
      else throw new Error("Memo is not a SCRAM presale seat");
      continue;
    }

    if (programId === SYSTEM_PROGRAM_ID) {
      const transferred = readTransferLamports(data);
      const source = input.accountKeys[indexes[0]];
      const destination = input.accountKeys[indexes[1]];
      if (!source || !destination) throw new Error("Transfer accounts are missing");
      if (!destination.equals(vaultKey)) {
        throw new Error("Presale SOL must go only to the treasury");
      }
      const sourceAddress = source.toBase58();
      if (!signers.has(sourceAddress)) throw new Error("Presale buyer must sign the transfer");
      if (buyer && buyer !== sourceAddress) throw new Error("Presale has more than one buyer");
      buyer = sourceAddress;
      lamports += transferred;
      vaultTransfers += 1;
      continue;
    }

    throw new Error("Presale transaction includes an unexpected program");
  }

  if (!memoOk) throw new Error("Presale memo is missing");
  if (!buyer || vaultTransfers !== 1) throw new Error("Presale transfer to the treasury is missing");
  if (buyer === vaultKey.toBase58()) throw new Error("The treasury wallet cannot buy its own presale");
  if (lamports < BigInt(PRESALE_MIN_LAMPORTS) || lamports > BigInt(PRESALE_MAX_LAMPORTS)) {
    throw new Error("Presale amount is outside the allowed range");
  }

  return {
    signature: input.signature,
    buyer,
    lamports: Number(lamports),
    slot: input.slot ?? null,
    blockTime: input.blockTime ?? null,
  };
}

export function mergePresaleSales(existing: PresaleSale[], incoming: PresaleSale[]): PresaleSale[] {
  const bySignature = new Map<string, PresaleSale>();
  for (const sale of existing) bySignature.set(sale.signature, sale);
  for (const sale of incoming) bySignature.set(sale.signature, sale);
  return [...bySignature.values()].sort((left, right) => {
    const time = (right.blockTime ?? 0) - (left.blockTime ?? 0);
    if (time !== 0) return time;
    return right.signature.localeCompare(left.signature);
  });
}

export function presaleTotals(sales: PresaleSale[]): {
  sales: number;
  buyers: number;
  lamports: number;
  sol: string;
} {
  const lamports = sales.reduce((sum, sale) => sum + sale.lamports, 0);
  return {
    sales: sales.length,
    buyers: new Set(sales.map((sale) => sale.buyer)).size,
    lamports,
    sol: formatSol(lamports),
  };
}

/** Buyer export used to seat presale wallets into the block-0 bundle by hand. */
export function presaleCsv(sales: PresaleSale[]): string {
  const lines = ["buyer,sol,lamports,signature,slot,block_time,seat"];
  for (const sale of sales) {
    lines.push(
      [
        sale.buyer,
        formatSol(sale.lamports),
        sale.lamports,
        sale.signature,
        sale.slot ?? "",
        sale.blockTime ?? "",
        "block-0 bundle",
      ].join(",")
    );
  }
  return `${lines.join("\n")}\n`;
}
