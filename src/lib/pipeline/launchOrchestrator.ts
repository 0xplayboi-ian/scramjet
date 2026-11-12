import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  createSetAuthorityInstruction,
  AuthorityType,
  createInitializeMintInstruction,
  createAssociatedTokenAccountIdempotentInstruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
} from "@solana/spl-token";
import { LaunchConfig, SolanaLaunchpad, SubWallet } from "../../types";
import { turnkeyManager } from "../wallets/turnkeyManager";
import { GhostFunder, DispersalPlan } from "../wallets/ghostFunder";
import { BundleBuilder, AssembledBundle } from "../jito/bundleBuilder";
import { jitoClient } from "../jito/jitoClient";
import { PumpFunAdapter } from "../adapters/pumpFun";
import { MeteoraDbcAdapter } from "../adapters/meteoraDbc";
import { RaydiumLaunchLabAdapter } from "../adapters/raydium";
import { calculateProtocolFee, buildProtocolFeeInstruction } from "../feeRouter";
import { FeeBuybackFlywheel } from "../automations/feeBuyback";
import {
  SOLANA_INCINERATOR_ADDRESS,
  SOLANA_INCINERATOR_SOLSCAN,
  CANONICAL_HARD_CAP_33RD,
  CANONICAL_DECIMALS_33RD,
} from "../constants";

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
   * Generates atomic instructions to initialize a hard-capped token supply (e.g. 33,333,333 $33RD),
   * mint the entire supply into a designated distribution vault, and immediately & permanently
   * revoke both Mint Authority and Freeze Authority.
   */
  public static async buildTokenGenesisAndRevocationInstructions(params: {
    connection?: Connection;
    payer: PublicKey;
    mintPublicKey: PublicKey;
    mintAuthority: PublicKey;
    freezeAuthority?: PublicKey;
    distributionVault: PublicKey;
    supplyTokens: number | bigint;
    decimals?: number;
    tokenProgramId?: PublicKey;
    createMintAccount?: boolean;
    revokeMintAuthority?: boolean;
    revokeFreezeAuthority?: boolean;
  }): Promise<TransactionInstruction[]> {
    const {
      payer,
      mintPublicKey,
      mintAuthority,
      freezeAuthority = mintAuthority,
      distributionVault,
      supplyTokens,
      decimals = CANONICAL_DECIMALS_33RD,
      tokenProgramId = TOKEN_PROGRAM_ID,
      createMintAccount = false,
      revokeMintAuthority = true,
      revokeFreezeAuthority = true,
      connection,
    } = params;

    const instructions: TransactionInstruction[] = [];

    // 1. Optionally allocate and assign the mint account with rent exemption
    if (createMintAccount) {
      let lamports = 1_066_800; // standard rent exemption for 82-byte MintLayout
      if (connection) {
        try {
          lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
        } catch {
          // fallback to standard rent exemption
        }
      }
      instructions.push(
        SystemProgram.createAccount({
          fromPubkey: payer,
          newAccountPubkey: mintPublicKey,
          space: MINT_SIZE,
          lamports,
          programId: tokenProgramId,
        })
      );
    }

    // 2. Initialize SPL Token Mint with initial authorities
    instructions.push(
      createInitializeMintInstruction(
        mintPublicKey,
        decimals,
        mintAuthority,
        freezeAuthority,
        tokenProgramId
      )
    );

    // 3. Create Idempotent Associated Token Account for Distribution Vault
    const vaultAta = getAssociatedTokenAddressSync(
      mintPublicKey,
      distributionVault,
      true,
      tokenProgramId
    );

    instructions.push(
      createAssociatedTokenAccountIdempotentInstruction(
        payer,
        vaultAta,
        distributionVault,
        mintPublicKey,
        tokenProgramId
      )
    );

    // 4. Mint exact hard cap supply to the Distribution Vault
    const multiplier = BigInt(10) ** BigInt(decimals);
    const rawTokens = typeof supplyTokens === "bigint" ? supplyTokens : BigInt(supplyTokens);
    const amountAtomic = rawTokens * multiplier;

    instructions.push(
      createMintToInstruction(
        mintPublicKey,
        vaultAta,
        mintAuthority,
        amountAtomic,
        [],
        tokenProgramId
      )
    );

    // 5. Irrevocably revoke Mint Authority (permanently fixes hard cap supply)
    if (revokeMintAuthority) {
      instructions.push(
        createSetAuthorityInstruction(
          mintPublicKey,
          mintAuthority,
          AuthorityType.MintTokens,
          null,
          [],
          tokenProgramId
        )
      );
    }

    // 6. Irrevocably revoke Freeze Authority (ensures censorship resistance)
    if (revokeFreezeAuthority) {
      instructions.push(
        createSetAuthorityInstruction(
          mintPublicKey,
          freezeAuthority,
          AuthorityType.FreezeAccount,
          null,
          [],
          tokenProgramId
        )
      );
    }

    return instructions;
  }

  /**
   * Generates dedicated instruction sequence to burn 100% of LP tokens
   * directly to the canonical Solana Incinerator address.
   */
  public static buildLpBurnInstructions(params: {
    launchpad: SolanaLaunchpad;
    payer: PublicKey;
    creator: PublicKey;
    tokenMint: PublicKey;
    quoteMint: PublicKey;
    platformConfigAddress?: string;
    lpTokenAmount?: bigint | number;
    incineratorAddress?: PublicKey;
    tokenProgramId?: PublicKey;
  }): TransactionInstruction[] {
    const {
      launchpad,
      payer,
      creator,
      tokenMint,
      quoteMint,
      platformConfigAddress = "CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW",
      lpTokenAmount = BigInt(1_000_000_000),
      incineratorAddress = SOLANA_INCINERATOR_ADDRESS,
      tokenProgramId = TOKEN_PROGRAM_ID,
    } = params;

    if (launchpad === "RAYDIUM_LAUNCHLAB") {
      const platformConfig = new PublicKey(platformConfigAddress);
      const [poolPda] = RaydiumLaunchLabAdapter.getPoolPDA(platformConfig, tokenMint, quoteMint);
      const [lpMint] = RaydiumLaunchLabAdapter.getLpMintPDA(poolPda);

      return RaydiumLaunchLabAdapter.buildBurnLpToIncineratorInstructions({
        payer,
        sourceLpOwner: creator,
        lpMint,
        amountLpTokens: lpTokenAmount,
        tokenProgramId,
        incineratorAddress,
      });
    }

    if (launchpad === "METEORA_DBC") {
      const [poolPda] = MeteoraDbcAdapter.getPoolPDA(tokenMint, quoteMint);
      const [lpMint] = MeteoraDbcAdapter.getLpMintPDA(poolPda);

      return MeteoraDbcAdapter.buildBurnLpToIncineratorInstructions({
        payer,
        sourceLpOwner: creator,
        lpMint,
        amountLpTokens: lpTokenAmount,
        tokenProgramId,
        incineratorAddress,
      });
    }

    return [];
  }

  /**
   * Executes full end-to-end launch pipeline:
   * 1. Sub-wallet creation via Turnkey Enclaves
   * 2. Ghost Funder anti-clustering relay plan
   * 3. On-chain token genesis, vault distribution & irrevocable authority revocation
   * 4. Launchpad pool initialization (PumpFun / Meteora DBC / Raydium LaunchLab)
   * 5. 100% LP token burn to canonical Solana Incinerator
   * 6. Atomic Block-0 Jito bundle compilation
   * 7. Multi-region block engine dispatch
   */
  public static async executeLaunch(params: {
    config: LaunchConfig;
    connection: Connection;
    masterPayer: PublicKey;
    mintKeypairOverride?: Keypair;
  }): Promise<LaunchOrchestrationResult> {
    const { config, connection, masterPayer, mintKeypairOverride } = params;

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

    // 3. Mint Keypair and instruction compilation
    const mintKeypair = mintKeypairOverride || Keypair.generate();
    const deployIxs: TransactionInstruction[] = [];
    const additionalSigners: Keypair[] = [];

    const is33rdOrSingularity =
      config.block0Config.preset === "THE_SINGULARITY_PROTOCOL" ||
      config.tokenSymbol === "33RD" ||
      config.lpBurnTarget === SOLANA_INCINERATOR_ADDRESS.toBase58();

    const initialSupply =
      config.totalSupply ??
      config.tokenGenesis?.initialSupply ??
      (is33rdOrSingularity ? CANONICAL_HARD_CAP_33RD : undefined);

    const decimals =
      config.decimals ??
      config.tokenGenesis?.decimals ??
      CANONICAL_DECIMALS_33RD;

    const distributionVaultPubkey = config.distributionVault
      ? new PublicKey(config.distributionVault)
      : config.tokenGenesis?.distributionVault
      ? new PublicKey(config.tokenGenesis.distributionVault)
      : masterPayer;

    const shouldRevokeMint =
      config.revokeMintAuthority ??
      config.tokenGenesis?.revokeMintAuthority ??
      is33rdOrSingularity ??
      false;

    const shouldRevokeFreeze =
      config.revokeFreezeAuthority ??
      config.tokenGenesis?.revokeFreezeAuthority ??
      is33rdOrSingularity ??
      false;

    const shouldBurnLp = Boolean(
      config.raydiumOptions?.burnLpToIncinerator ||
      config.meteoraDbcOptions?.burnLpToIncinerator ||
      config.tokenGenesis?.burnLpToIncinerator ||
      config.lpBurnPercent === 100 ||
      is33rdOrSingularity
    );

    // 3a. Token Genesis: Mint hard cap supply into Distribution Vault before authority revocation
    if (initialSupply && initialSupply > 0) {
      const genesisIxs = await this.buildTokenGenesisAndRevocationInstructions({
        connection,
        payer: masterPayer,
        mintPublicKey: mintKeypair.publicKey,
        mintAuthority: masterPayer,
        freezeAuthority: masterPayer,
        distributionVault: distributionVaultPubkey,
        supplyTokens: initialSupply,
        decimals,
        createMintAccount: true,
        revokeMintAuthority: false, // Revoked in step 3c after pool initialization
        revokeFreezeAuthority: false,
      });

      deployIxs.push(...genesisIxs);
      additionalSigners.push(mintKeypair);
    }

    // 3b. Launchpad Pool Initialization
    const quoteMint = new PublicKey("So11111111111111111111111111111111111111112"); // WSOL

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
          quoteMint,
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
          quoteMint,
          options: {
            platformConfigAddress,
            autoLockLpTokens: !shouldBurnLp, // If burned, lock flag can be disabled
            ...config.raydiumOptions,
          },
        })
      );
    }

    // 3c. Permanent LP Token Burn to Canonical Solana Incinerator
    if (shouldBurnLp && (config.launchpad === "RAYDIUM_LAUNCHLAB" || config.launchpad === "METEORA_DBC")) {
      const lpBurnIxs = this.buildLpBurnInstructions({
        launchpad: config.launchpad,
        payer: masterPayer,
        creator: masterPayer,
        tokenMint: mintKeypair.publicKey,
        quoteMint,
        platformConfigAddress: config.raydiumOptions?.platformConfigAddress,
        lpTokenAmount:
          config.raydiumOptions?.lpTokenAmount ??
          config.meteoraDbcOptions?.lpTokenAmount ??
          BigInt(1_000_000_000),
        incineratorAddress: SOLANA_INCINERATOR_ADDRESS,
      });
      deployIxs.push(...lpBurnIxs);
    }

    // 3d. Irrevocable Authority Revocations (Enforcing immutable hard cap & censorship resistance)
    if (shouldRevokeMint) {
      deployIxs.push(
        createSetAuthorityInstruction(
          mintKeypair.publicKey,
          masterPayer,
          AuthorityType.MintTokens,
          null,
          [],
          TOKEN_PROGRAM_ID
        )
      );
    }

    if (shouldRevokeFreeze) {
      deployIxs.push(
        createSetAuthorityInstruction(
          mintKeypair.publicKey,
          masterPayer,
          AuthorityType.FreezeAccount,
          null,
          [],
          TOKEN_PROGRAM_ID
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
      additionalDeploySigners: additionalSigners,
    });

    // 5. Multi-Region Jito Block Engine Dispatch
    const { bundleId, engineResults } = await jitoClient.sendBundle(
      assembledBundle.encodedTransactions
    );

    return {
      mintPublicKey: mintKeypair.publicKey.toBase58(),
      bundleId,
      subWalletsCount: subWallets.length,
      totalSolCommitted: config.devBuySol + Number(tipLamports) / 1e9,
      dispersalPlan,
      status: "BUNDLE_SUBMITTED",
      blockEngineResults: engineResults,
      mintAuthorityRevoked: shouldRevokeMint,
      freezeAuthorityRevoked: shouldRevokeFreeze,
      lpBurnTargetAddress: shouldBurnLp ? SOLANA_INCINERATOR_ADDRESS.toBase58() : config.lpBurnTarget,
      lpBurnSolscanUrl: shouldBurnLp
        ? SOLANA_INCINERATOR_SOLSCAN
        : config.lpBurnTarget
        ? `https://solscan.io/account/${config.lpBurnTarget}`
        : undefined,
      metadataUri:
        config.metadataUri ||
        (is33rdOrSingularity
          ? "https://33rdtreelabs.tech/assets/token_metadata.json"
          : undefined),
      totalSupply: initialSupply,
    };
  }
}
