import assert from "node:assert/strict";
import test from "node:test";
import { Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { DEFAULT_PLATFORM_FEE_VAULT } from "../constants";
import {
  MEMO_PROGRAM_ID,
  PRESALE_MEMO_TAG,
  buildPresaleInstructions,
  formatSol,
  mergePresaleSales,
  presaleCsv,
  readPresaleFromMessage,
  solToLamports,
} from "./protocol";

const buyer = Keypair.generate().publicKey;
const other = Keypair.generate().publicKey;

function messageFor(instructions: TransactionInstruction[], feePayer: PublicKey) {
  const tx = new Transaction();
  tx.feePayer = feePayer;
  tx.recentBlockhash = Keypair.generate().publicKey.toBase58();
  tx.add(...instructions);
  const message = tx.compileMessage();
  return {
    accountKeys: message.accountKeys,
    numSigners: message.header.numRequiredSignatures,
    instructions: message.compiledInstructions,
  };
}

test("presale instructions pay the treasury directly and stamp the seat memo", () => {
  const lamports = solToLamports("1.25");
  const instructions = buildPresaleInstructions(buyer, lamports, DEFAULT_PLATFORM_FEE_VAULT);
  assert.equal(instructions.length, 2);
  assert.equal(instructions[0].programId.equals(SystemProgram.programId), true);
  assert.equal(instructions[0].keys[1].pubkey.equals(DEFAULT_PLATFORM_FEE_VAULT), true);
  assert.equal(instructions[1].programId.equals(MEMO_PROGRAM_ID), true);
  assert.equal(instructions[1].data.toString("utf8"), PRESALE_MEMO_TAG);

  const sale = readPresaleFromMessage({
    signature: "sig-direct",
    vault: DEFAULT_PLATFORM_FEE_VAULT.toBase58(),
    err: null,
    slot: 10,
    blockTime: 20,
    ...messageFor(instructions, buyer),
  });
  assert.equal(sale.buyer, buyer.toBase58());
  assert.equal(sale.lamports, lamports);
  assert.equal(formatSol(sale.lamports), "1.25");
});

test("presale rejects a second transfer that skims SOL off the treasury", () => {
  const instructions = buildPresaleInstructions(buyer, solToLamports("0.5"), DEFAULT_PLATFORM_FEE_VAULT);
  instructions.push(
    SystemProgram.transfer({
      fromPubkey: buyer,
      toPubkey: other,
      lamports: solToLamports("0.1"),
    })
  );
  assert.throws(
    () =>
      readPresaleFromMessage({
        signature: "sig-skim",
        vault: DEFAULT_PLATFORM_FEE_VAULT.toBase58(),
        err: null,
        ...messageFor(instructions, buyer),
      }),
    /only to the treasury/
  );
});

test("presale rejects a payment with no seat memo", () => {
  const instructions = [
    SystemProgram.transfer({
      fromPubkey: buyer,
      toPubkey: DEFAULT_PLATFORM_FEE_VAULT,
      lamports: solToLamports("1"),
    }),
  ];
  assert.throws(
    () =>
      readPresaleFromMessage({
        signature: "sig-nomemo",
        vault: DEFAULT_PLATFORM_FEE_VAULT.toBase58(),
        err: null,
        ...messageFor(instructions, buyer),
      }),
    /memo is missing/
  );
});

test("the treasury cannot buy its own presale", () => {
  assert.throws(
    () => buildPresaleInstructions(DEFAULT_PLATFORM_FEE_VAULT, solToLamports("1")),
    /cannot buy its own presale/
  );
});

test("buyer export lists each wallet as a block-0 bundle seat", () => {
  const sales = mergePresaleSales(
    [
      {
        signature: "older",
        buyer: other.toBase58(),
        lamports: solToLamports("0.25"),
        slot: 1,
        blockTime: 10,
      },
    ],
    [
      {
        signature: "older",
        buyer: other.toBase58(),
        lamports: solToLamports("0.25"),
        slot: 1,
        blockTime: 10,
      },
      {
        signature: "newer",
        buyer: buyer.toBase58(),
        lamports: solToLamports("2"),
        slot: 2,
        blockTime: 30,
      },
    ]
  );
  assert.equal(sales.length, 2);
  assert.equal(sales[0].signature, "newer");
  const csv = presaleCsv(sales);
  assert.match(csv, /^buyer,sol,lamports,signature,slot,block_time,seat/);
  assert.equal(csv.includes("block-0 bundle"), true);
  assert.equal(csv.split("block-0 bundle").length - 1, 2);
});

test("amounts below the seat minimum are refused", () => {
  assert.throws(() => solToLamports("0.01"), /Minimum presale is 0.05 SOL/);
  assert.throws(() => solToLamports("1.1234567891"), /up to 9 decimal/);
});
