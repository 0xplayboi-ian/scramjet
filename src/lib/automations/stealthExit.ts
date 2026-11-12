import { SubWallet } from "../../types";

export interface StealthExitConfig {
  targetWallets: SubWallet[];
  totalTokenSupply: number;
  currentPriceSol: number;
  minSliceSol: number; // e.g. 0.05 SOL
  maxSliceSol: number; // e.g. 0.35 SOL
  minIntervalSeconds: number; // e.g. 15s
  maxIntervalSeconds: number; // e.g. 60s
  onlyOnGreenCandle: boolean;
  maxSlippageBps: number; // e.g. 150 = 1.5%
}

export interface ScheduledStealthSlice {
  sliceId: string;
  walletPubkey: string;
  walletIndex: number;
  tokenAmount: number;
  estimatedSolOutput: number;
  scheduledDelaySeconds: number;
  executeAtTimestamp: number;
  status: "PENDING" | "EXECUTING" | "COMPLETED" | "SKIPPED_RED_CANDLE" | "FAILED";
}

export interface StealthExitPlan {
  totalSlices: number;
  totalTokensToLiquidate: number;
  estimatedTotalSol: number;
  estimatedDurationMinutes: number;
  averageSliceSol: number;
  slices: ScheduledStealthSlice[];
}

export class StealthExitEngine {
  /**
   * Generates a randomized, non-clustering stealth exit schedule across multiple sub-wallets.
   * Prevents chart dumps by slicing tokens into small, human-like retail order sizes
   * with randomized timing jitter and randomized wallet rotation.
   */
  public static generatePlan(config: StealthExitConfig): StealthExitPlan {
    const {
      targetWallets,
      currentPriceSol,
      minSliceSol,
      maxSliceSol,
      minIntervalSeconds,
      maxIntervalSeconds,
    } = config;

    const eligibleWallets = targetWallets.filter((w) => w.tokenBalance > 0);
    if (eligibleWallets.length === 0 || currentPriceSol <= 0) {
      return {
        totalSlices: 0,
        totalTokensToLiquidate: 0,
        estimatedTotalSol: 0,
        estimatedDurationMinutes: 0,
        averageSliceSol: 0,
        slices: [],
      };
    }

    const slices: ScheduledStealthSlice[] = [];
    let cumulativeDelay = 0;
    const now = Date.now();

    // Clone wallet balances to track simulated liquidation
    const walletBalances = eligibleWallets.map((w, idx) => ({
      pubkey: w.publicKey,
      index: (w as any).index ?? idx,
      remainingTokens: w.tokenBalance,
    }));

    let totalTokensLeft = walletBalances.reduce((sum, w) => sum + w.remainingTokens, 0);

    // Keep generating randomized slices until all balances are planned
    let iteration = 0;
    const maxIterations = 500; // safety ceiling

    while (totalTokensLeft > 0 && iteration < maxIterations) {
      iteration++;

      // Pick a random wallet that still has balance
      const availableWallets = walletBalances.filter((w) => w.remainingTokens > 0);
      if (availableWallets.length === 0) break;

      const randomWallet = availableWallets[Math.floor(Math.random() * availableWallets.length)];

      // Randomize slice size in SOL
      const randomSolSize =
        minSliceSol + Math.random() * (maxSliceSol - minSliceSol);
      const targetTokenSize = Math.floor(randomSolSize / currentPriceSol);

      // Bound to remaining tokens
      const actualTokenSize = Math.min(targetTokenSize, randomWallet.remainingTokens);
      if (actualTokenSize <= 0) {
        randomWallet.remainingTokens = 0;
        continue;
      }

      randomWallet.remainingTokens -= actualTokenSize;
      totalTokensLeft -= actualTokenSize;

      // Randomize interval jitter
      const jitterSeconds = Math.floor(
        minIntervalSeconds + Math.random() * (maxIntervalSeconds - minIntervalSeconds)
      );
      cumulativeDelay += jitterSeconds;

      const sliceSol = actualTokenSize * currentPriceSol;

      slices.push({
        sliceId: `stealth_slice_${slices.length + 1}`,
        walletPubkey: randomWallet.pubkey,
        walletIndex: randomWallet.index,
        tokenAmount: actualTokenSize,
        estimatedSolOutput: Number(sliceSol.toFixed(4)),
        scheduledDelaySeconds: cumulativeDelay,
        executeAtTimestamp: now + cumulativeDelay * 1000,
        status: "PENDING",
      });
    }

    const totalTokensToLiquidate = slices.reduce((acc, s) => acc + s.tokenAmount, 0);
    const estimatedTotalSol = slices.reduce((acc, s) => acc + s.estimatedSolOutput, 0);

    return {
      totalSlices: slices.length,
      totalTokensToLiquidate,
      estimatedTotalSol: Number(estimatedTotalSol.toFixed(4)),
      estimatedDurationMinutes: Number((cumulativeDelay / 60).toFixed(1)),
      averageSliceSol: slices.length > 0 ? Number((estimatedTotalSol / slices.length).toFixed(4)) : 0,
      slices,
    };
  }

  /**
   * Evaluates if a given slice is safe to execute based on current market candle state.
   */
  public static canExecuteSlice(
    slice: ScheduledStealthSlice,
    currentPrice: number,
    candleOpenPrice: number,
    onlyOnGreen: boolean
  ): boolean {
    if (onlyOnGreen && currentPrice < candleOpenPrice) {
      return false;
    }
    return true;
  }
}
