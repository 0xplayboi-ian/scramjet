import {
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferInstruction,
  createBurnInstruction,
} from "@solana/spl-token";
import { SOLANA_INCINERATOR_ADDRESS } from "../constants";

export interface LpBurnParams {
  payer: PublicKey;
  sourceLpOwner: PublicKey;
  lpMint: PublicKey;
  amountLpTokens: bigint | number;
  tokenProgramId?: PublicKey;
  incineratorAddress?: PublicKey;
}

export class LpBurner {
  /**
   * Canonical Solana Incinerator address for permanent supply & LP destruction.
   * Public key: 1nc1nerator11111111111111111111111111111111
   */
  public static readonly CANONICAL_INCINERATOR = SOLANA_INCINERATOR_ADDRESS;

  /**
   * Derives the Associated Token Account (ATA) for the Solana Incinerator for a given LP mint.
   */
  public static getIncineratorLpAta(
    lpMint: PublicKey,
    tokenProgramId: PublicKey = TOKEN_PROGRAM_ID,
    incineratorAddress: PublicKey = SOLANA_INCINERATOR_ADDRESS
  ): PublicKey {
    return getAssociatedTokenAddressSync(
      lpMint,
      incineratorAddress,
      true, // allowOwnerOffCurve = true
      tokenProgramId
    );
  }

  /**
   * Generates an instruction sequence to transfer 100% of the specified LP tokens
   * directly to the canonical Solana Incinerator address:
   * 1. Idempotently creates the Incinerator's Associated Token Account (funded by payer).
   * 2. Transfers 100% of the LP tokens from the source owner to the Incinerator ATA.
   *
   * Once transferred, the LP tokens cannot be retrieved, ensuring 100% permanently burned liquidity.
   */
  public static buildBurnLpToIncineratorInstructions(
    params: LpBurnParams
  ): TransactionInstruction[] {
    const {
      payer,
      sourceLpOwner,
      lpMint,
      amountLpTokens,
      tokenProgramId = TOKEN_PROGRAM_ID,
      incineratorAddress = SOLANA_INCINERATOR_ADDRESS,
    } = params;

    const amount =
      typeof amountLpTokens === "number" ? BigInt(amountLpTokens) : amountLpTokens;

    if (amount <= BigInt(0)) {
      throw new Error("LP token burn amount must be strictly greater than zero");
    }

    const sourceLpAta = getAssociatedTokenAddressSync(
      lpMint,
      sourceLpOwner,
      true,
      tokenProgramId
    );

    const incineratorLpAta = this.getIncineratorLpAta(
      lpMint,
      tokenProgramId,
      incineratorAddress
    );

    const instructions: TransactionInstruction[] = [];

    // 1. Ensure Incinerator has an Associated Token Account (idempotent, rent paid by payer)
    instructions.push(
      createAssociatedTokenAccountIdempotentInstruction(
        payer,
        incineratorLpAta,
        incineratorAddress,
        lpMint,
        tokenProgramId
      )
    );

    // 2. Transfer 100% of LP tokens directly to Incinerator
    instructions.push(
      createTransferInstruction(
        sourceLpAta,
        incineratorLpAta,
        sourceLpOwner,
        amount,
        [],
        tokenProgramId
      )
    );

    return instructions;
  }

  /**
   * Alternative direct burn instruction via SPL-Token Program
   * (decreases total supply on-chain rather than transferring to Incinerator).
   */
  public static buildDirectSplBurnInstruction(params: {
    sourceAccount: PublicKey;
    mint: PublicKey;
    owner: PublicKey;
    amount: bigint | number;
    tokenProgramId?: PublicKey;
  }): TransactionInstruction {
    const {
      sourceAccount,
      mint,
      owner,
      amount,
      tokenProgramId = TOKEN_PROGRAM_ID,
    } = params;

    const burnAmount = typeof amount === "number" ? BigInt(amount) : amount;

    return createBurnInstruction(
      sourceAccount,
      mint,
      owner,
      burnAmount,
      [],
      tokenProgramId
    );
  }
}
