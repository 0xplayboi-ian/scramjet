import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  DEFAULT_PLATFORM_FEE_VAULT,
  PROTOCOL_FEE_BPS,
} from "../constants";

export interface AffiliateSplitConfig {
  grossAmountLamports: bigint;
  referrerWallet: PublicKey | string;
  referralCode?: string;
  feeBps?: number; // defaults to 350 bps
  referrerSharePercent?: number; // defaults to 30%
}

export interface AffiliateSplitResult {
  totalFeeLamports: bigint;
  platformShareLamports: bigint;
  referrerShareLamports: bigint;
  totalFeeSol: number;
  platformShareSol: number;
  referrerShareSol: number;
  referrerPubkey: PublicKey;
  platformVaultPubkey: PublicKey;
}

export class AffiliateEngine {
  public static readonly DEFAULT_REFERRER_SHARE = 30; // 30% of platform fees

  /**
   * Generates a deterministic referral link for KOLs and partners.
   */
  public static generateReferralLink(codeOrWallet: string, baseUrl: string = "https://scramjet.fun"): string {
    const clean = encodeURIComponent(codeOrWallet.trim());
    return `${baseUrl}/ref/${clean}`;
  }

  /**
   * Calculates the split between the platform treasury and the referrer.
   */
  public static calculateAffiliateSplit(config: AffiliateSplitConfig): AffiliateSplitResult {
    const {
      grossAmountLamports,
      referrerWallet,
      feeBps = PROTOCOL_FEE_BPS,
      referrerSharePercent = this.DEFAULT_REFERRER_SHARE,
    } = config;

    // Total fee in lamports (e.g. 3.5% = 350 / 10,000)
    const totalFeeLamports = (grossAmountLamports * BigInt(feeBps)) / BigInt(10_000);

    // Referrer share (e.g. 30%)
    const referrerShareLamports = (totalFeeLamports * BigInt(referrerSharePercent)) / BigInt(100);
    const platformShareLamports = totalFeeLamports - referrerShareLamports;

    const referrerPubkey =
      typeof referrerWallet === "string" ? new PublicKey(referrerWallet) : referrerWallet;

    return {
      totalFeeLamports,
      platformShareLamports,
      referrerShareLamports,
      totalFeeSol: Number(totalFeeLamports) / LAMPORTS_PER_SOL,
      platformShareSol: Number(platformShareLamports) / LAMPORTS_PER_SOL,
      referrerShareSol: Number(referrerShareLamports) / LAMPORTS_PER_SOL,
      referrerPubkey,
      platformVaultPubkey: DEFAULT_PLATFORM_FEE_VAULT,
    };
  }

  /**
   * Constructs atomic on-chain transfer instructions splitting the fee between
   * the Scramjet Treasury and the Referrer in the exact same transaction.
   */
  public static buildSplitFeeInstructions(
    payer: PublicKey,
    config: AffiliateSplitConfig
  ): TransactionInstruction[] {
    const split = this.calculateAffiliateSplit(config);
    const instructions: TransactionInstruction[] = [];

    // Transfer platform share
    if (split.platformShareLamports > BigInt(0)) {
      instructions.push(
        SystemProgram.transfer({
          fromPubkey: payer,
          toPubkey: split.platformVaultPubkey,
          lamports: split.platformShareLamports,
        })
      );
    }

    // Transfer referrer cut directly
    if (split.referrerShareLamports > BigInt(0)) {
      instructions.push(
        SystemProgram.transfer({
          fromPubkey: payer,
          toPubkey: split.referrerPubkey,
          lamports: split.referrerShareLamports,
        })
      );
    }

    return instructions;
  }
}
