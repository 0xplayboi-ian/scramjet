import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createBurnInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferInstruction,
} from "@solana/spl-token";
import { CreatorFeeStrategy } from "../../types";
import { PumpFunAdapter } from "../adapters/pumpFun";
import { SOLANA_INCINERATOR_ADDRESS } from "../constants";
import {
  calculate75_15_10FeeSplit,
  build75_15_10FeeSplitInstructions,
  ProtocolFeeSplitResult,
} from "../feeRouter";

export interface FeeAllocationResult {
  totalHarvestLamports: bigint;
  creatorHarvestSol: number;
  buybackBurnSol: number;
  stableSwapSol: number;
  incineratorSol?: number;
  instructions: TransactionInstruction[];
}

export class FeeBuybackFlywheel {
  /**
   * Canonical Solana Incinerator address for permanent supply & LP destruction.
   */
  public static readonly CANONICAL_INCINERATOR = SOLANA_INCINERATOR_ADDRESS;

  /**
   * Calculates fee distribution according to CreatorFeeStrategy
   * and builds on-chain buyback, burn, and incinerator routing instructions.
   */
  public static planFeeAllocation(params: {
    harvestLamports: bigint;
    strategy: CreatorFeeStrategy;
    creatorPubkey: PublicKey;
    mintPubkey: PublicKey;
    userTokenAccount: PublicKey;
    burnToIncinerator?: boolean; // When true, transfers buyback tokens to Incinerator instead of burn instruction
  }): FeeAllocationResult {
    const {
      harvestLamports,
      strategy,
      creatorPubkey,
      mintPubkey,
      userTokenAccount,
      burnToIncinerator = false,
    } = params;
    const { feeAllocation } = strategy;

    const totalSol = Number(harvestLamports) / 1e9;
    const creatorSol = (totalSol * feeAllocation.creatorSolPercent) / 100;
    const buybackSol = (totalSol * feeAllocation.buybackAndBurnPercent) / 100;
    const stableSwapSol = (totalSol * feeAllocation.stablecoinSwapUsdcPercent) / 100;
    const incineratorSol =
      feeAllocation.incineratorBurnPercent && feeAllocation.incineratorBurnPercent > 0
        ? (totalSol * feeAllocation.incineratorBurnPercent) / 100
        : 0;

    const instructions: TransactionInstruction[] = [];

    // 1. Direct SOL routing to Solana Incinerator (if configured e.g. 10%)
    if (incineratorSol > 0) {
      const incineratorLamports = BigInt(Math.floor(incineratorSol * 1e9));
      instructions.push(
        this.buildIncineratorSolBurnInstruction({
          payer: creatorPubkey,
          lamports: incineratorLamports,
        })
      );
    }

    // 2. If buyback and burn is active (>0%)
    if (buybackSol > 0) {
      const buybackLamports = BigInt(Math.floor(buybackSol * 1e9));
      const [bondingCurve] = PumpFunAdapter.getBondingCurvePDA(mintPubkey);
      const [associatedBondingCurve] = PublicKey.findProgramAddressSync(
        [bondingCurve.toBuffer(), Buffer.from([6]), mintPubkey.toBuffer()],
        PumpFunAdapter.PROGRAM_ID
      );

      // 2a. Buy tokens on curve
      instructions.push(
        PumpFunAdapter.buyInstruction({
          payer: creatorPubkey,
          mint: mintPubkey,
          bondingCurve,
          associatedBondingCurve,
          associatedUserToken: userTokenAccount,
          amountLamports: buybackLamports,
          maxSolCost: buybackLamports * BigInt(2),
        })
      );

      // 2b. Permanently burn acquired tokens
      if (burnToIncinerator) {
        // Transfer bought-back tokens directly to canonical Solana Incinerator
        const incineratorIxs = this.buildIncineratorTokenTransferInstruction({
          payer: creatorPubkey,
          sourceTokenAccount: userTokenAccount,
          mintPubkey,
          amountTokens: BigInt(1_000_000),
        });
        instructions.push(...incineratorIxs);
      } else {
        // Standard SPL Token Burn instruction
        instructions.push(
          createBurnInstruction(
            userTokenAccount,
            mintPubkey,
            creatorPubkey,
            BigInt(1_000_000), // Burn batch tokens
            [],
            TOKEN_PROGRAM_ID
          )
        );
      }
    }

    return {
      totalHarvestLamports: harvestLamports,
      creatorHarvestSol: Number(creatorSol.toFixed(4)),
      buybackBurnSol: Number(buybackSol.toFixed(4)),
      stableSwapSol: Number(stableSwapSol.toFixed(4)),
      incineratorSol: Number(incineratorSol.toFixed(4)),
      instructions,
    };
  }

  /**
   * Plans the canonical 33rd Tree Labs 75/15/10 fee split for incoming network fees.
   * 75% Node Operators, 15% Treasury R&D, 10% Solana Incinerator Burn.
   */
  public static planTokenomicsFeeSplit(params: {
    totalFeeLamports: bigint;
    payer: PublicKey;
    nodeOperatorsVault: PublicKey;
    treasuryVault: PublicKey;
    incineratorAddress?: PublicKey;
  }): {
    split: ProtocolFeeSplitResult;
    instructions: TransactionInstruction[];
  } {
    const {
      totalFeeLamports,
      payer,
      nodeOperatorsVault,
      treasuryVault,
      incineratorAddress = SOLANA_INCINERATOR_ADDRESS,
    } = params;

    const split = calculate75_15_10FeeSplit(totalFeeLamports);
    const instructions = build75_15_10FeeSplitInstructions({
      payer,
      totalFeeLamports,
      nodeOperatorsVault,
      treasuryVault,
      incineratorAddress,
    });

    return { split, instructions };
  }

  /**
   * Builds instruction sequence to route SPL tokens directly into the Solana Incinerator.
   */
  public static buildIncineratorTokenTransferInstruction(params: {
    payer: PublicKey;
    sourceTokenAccount: PublicKey;
    mintPubkey: PublicKey;
    amountTokens: bigint | number;
    tokenProgramId?: PublicKey;
    incineratorAddress?: PublicKey;
  }): TransactionInstruction[] {
    const {
      payer,
      sourceTokenAccount,
      mintPubkey,
      amountTokens,
      tokenProgramId = TOKEN_PROGRAM_ID,
      incineratorAddress = SOLANA_INCINERATOR_ADDRESS,
    } = params;

    const amount = typeof amountTokens === "number" ? BigInt(amountTokens) : amountTokens;
    const incineratorAta = getAssociatedTokenAddressSync(
      mintPubkey,
      incineratorAddress,
      true,
      tokenProgramId
    );

    return [
      createAssociatedTokenAccountIdempotentInstruction(
        payer,
        incineratorAta,
        incineratorAddress,
        mintPubkey,
        tokenProgramId
      ),
      createTransferInstruction(
        sourceTokenAccount,
        incineratorAta,
        payer,
        amount,
        [],
        tokenProgramId
      ),
    ];
  }

  /**
   * Builds instruction to route native SOL fees directly into the Solana Incinerator.
   */
  public static buildIncineratorSolBurnInstruction(params: {
    payer: PublicKey;
    lamports: bigint;
    incineratorAddress?: PublicKey;
  }): TransactionInstruction {
    const { payer, lamports, incineratorAddress = SOLANA_INCINERATOR_ADDRESS } = params;
    return SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: incineratorAddress,
      lamports,
    });
  }
}
