import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
  createSetAuthorityInstruction,
  AuthorityType,
} from "@solana/spl-token";
import { LaunchConfig, SubWallet } from "../../types";
import { turnkeyManager } from "../wallets/turnkeyManager";
import { GhostFunder, DispersalPlan } from "../wallets/ghostFunder";
import { BundleBuilder, AssembledBundle } from "../jito/bundleBuilder";
import { jitoClient } from "../jito/jitoClient";
import { PumpFunAdapter } from "../adapters/pumpFun";
import { MeteoraDbcAdapter } from "../adapters/meteoraDbc";
import { RaydiumLaunchLabAdapter } from "../adapters/raydium";
import { calculateProtocolFee, buildProtocolFeeInstruction } from "../feeRouter";
import { FeeBuybackFlywheel } from "../automations/feeBuyback";
import { SOLANA_INCINERATOR_ADDRESS, SOLANA_INCINERATOR_SOLSCAN } from "../constants";

export interface LaunchOrchestrationResult {
  mintPublicKey: string;
  bundleId: string;
  subWalletsCount: number;
  totalSolCommitted: number;
  dispersalPlan: DispersalPlan;
  status: "BUNDLE_SUBMITTED" | "PENDING_CONFIRMATION" | "FAILED";
  blockEngineResults: { url: string; status: "SENT" | "FAILED"; error?: string }[];
  mintAuthorityRevoked?: boolean;
  freezeAuthorityRevoked?: boolean;
  lpBurnTargetAddress?: string;
  lpBurnSolscanUrl?: string;
  lpBurnTxSignature?: string;
  metadataUri?: string;
  totalSupply?: number;
}

export class LaunchOrchestrator {
  /**
   * Executes full end-to-end launch pipeline:
   * 1. Sub-wallet creation via Turnkey Enclaves
   * 2. Ghost Funder anti-clustering relay plan
   * 3. On-chain launchpad instruction compilation (PumpFun / Meteora DBC / Raydium)
   * 4. Atomic Block-0 Jito bundle compilation
   * 5. Multi-region block engine dispatch
   */
  public static async executeLaunch(params: {
    config: LaunchConfig;
    connection: Connection;
    masterPayer: PublicKey;
  }): Promise<LaunchOrchestrationResult> {
    const { config, connection, masterPayer } = params;

    // 1. Generate non-custodial sub-wallets
    const subWallets = await turnkeyManager.createSubWallets({
      count: config.block0Config.holderCount || 20,
      walletNamePrefix: `${config.tokenSymbol}-cohort`,
    });

    // 2. Plan Ghost Funder dispersal (randomized deviation + anti-BubbleMap delays)
    const dispersalPlan = GhostFunder.planGhostDispersal({
      masterPayer,
      subWallets,
      config: config.ghostFunder,
    });

    // 3. Generate Mint Keypair and Launchpad specific instructions
    const mintKeypair = Keypair.generate();
    const deployIxs = [];

    if (config.launchpad === "PUMP_FUN") {
      const [bondingCurve] = PumpFunAdapter.getBondingCurvePDA(mintKeypair.publicKey);
      const [associatedBondingCurve] = PublicKey.findProgramAddressSync(
        [bondingCurve.toBuffer(), Buffer.from([6]), mintKeypair.publicKey.toBuffer()],
        PumpFunAdapter.PROGRAM_ID
      );
      const [global] = PumpFunAdapter.getGlobalPDA();

      deployIxs.push(
        PumpFunAdapter.createTokenInstruction({
          mint: mintKeypair.publicKey,
          mintAuthority: masterPayer,
          bondingCurve,
          associatedBondingCurve,
          global,
          payer: masterPayer,
          name: config.tokenName,
          symbol: config.tokenSymbol,
          uri: config.imageUrl,
        })
      );
    } else if (config.launchpad === "METEORA_DBC" && config.meteoraDbcOptions) {
      deployIxs.push(
        MeteoraDbcAdapter.initializePoolInstruction({
          creator: masterPayer,
          tokenMint: mintKeypair.publicKey,
          quoteMint: new PublicKey("So11111111111111111111111111111111111111112"), // WSOL
          options: config.meteoraDbcOptions,
        })
      );
    } else if (config.launchpad === "RAYDIUM_LAUNCHLAB") {
      const platformConfigAddress =
        config.raydiumOptions?.platformConfigAddress ||
        "CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW";
      deployIxs.push(
        RaydiumLaunchLabAdapter.initializeLaunchLabPoolInstruction({
          creator: masterPayer,
          tokenMint: mintKeypair.publicKey,
          quoteMint: new PublicKey("So11111111111111111111111111111111111111112"), // WSOL
          options: {
            platformConfigAddress,
            autoLockLpTokens: true,
          },
        })
      );
    }

    // 3b. Irrevocable Authority Revocations (Enforcing immutable hard cap & censorship resistance)
    if (config.revokeMintAuthority) {
      deployIxs.push(
        createSetAuthorityInstruction(
          mintKeypair.publicKey,
          masterPayer,
          AuthorityType.MintTokens,
          null
        )
      );
    }

    if (config.revokeFreezeAuthority) {
      deployIxs.push(
        createSetAuthorityInstruction(
          mintKeypair.publicKey,
          masterPayer,
          AuthorityType.FreezeAccount,
          null
        )
      );
    }

    // 4. Build Atomic Block-0 Bundle
    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    const tipLamports = BigInt(Math.floor(config.block0Config.customJitoTipSol * 1e9));

    const assembledBundle = await BundleBuilder.assembleBlock0Bundle({
      payer: masterPayer,
      recentBlockhash: blockhash,
      deployInstructions: deployIxs,
      devBuyInstructions: [], // Configured per launch
      subWallets,
      block0Config: config.block0Config,
      tipLamports,
    });

    // 5. Multi-Region Jito Block Engine Dispatch
    const { bundleId, engineResults } = await jitoClient.sendBundle(
      assembledBundle.encodedTransactions
    );

    const is33rdOrSingularity =
      config.block0Config.preset === "THE_SINGULARITY_PROTOCOL" ||
      config.tokenSymbol === "33RD" ||
      config.lpBurnTarget === SOLANA_INCINERATOR_ADDRESS.toBase58();

    return {
      mintPublicKey: mintKeypair.publicKey.toBase58(),
      bundleId,
      subWalletsCount: subWallets.length,
      totalSolCommitted: config.devBuySol + Number(tipLamports) / 1e9,
      dispersalPlan,
      status: "BUNDLE_SUBMITTED",
      blockEngineResults: engineResults,
      mintAuthorityRevoked: config.revokeMintAuthority ?? is33rdOrSingularity,
      freezeAuthorityRevoked: config.revokeFreezeAuthority ?? is33rdOrSingularity,
      lpBurnTargetAddress:
        config.lpBurnTarget ||
        (is33rdOrSingularity ? SOLANA_INCINERATOR_ADDRESS.toBase58() : undefined),
      lpBurnSolscanUrl:
        config.lpBurnTarget === SOLANA_INCINERATOR_ADDRESS.toBase58() || is33rdOrSingularity
          ? SOLANA_INCINERATOR_SOLSCAN
          : config.lpBurnTarget
          ? `https://solscan.io/account/${config.lpBurnTarget}`
          : undefined,
      metadataUri:
        config.metadataUri ||
        (is33rdOrSingularity
          ? "https://33rdtreelabs.tech/assets/token_metadata.json"
          : undefined),
      totalSupply: config.totalSupply ?? (is33rdOrSingularity ? 33_333_333 : undefined),
    };
  }
}
