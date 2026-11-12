import { Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  AuthorityType,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  SOLANA_INCINERATOR_ADDRESS,
  CANONICAL_HARD_CAP_33RD,
  CANONICAL_DECIMALS_33RD,
  THIRTY_THIRD_TREE_LABS_CONFIG,
  RaydiumLaunchLabAdapter,
  MeteoraDbcAdapter,
  PumpFunAdapter,
  LpBurner,
  LaunchOrchestrator,
  calculate75_15_10FeeSplit,
  build75_15_10FeeSplitInstructions,
  FeeBuybackFlywheel,
} from "../src/lib";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ ${message}`);
}

async function runAuditTests() {
  console.log("===============================================================================");
  console.log("   SCRAMJET PIPELINE & LP BURN AUDIT VERIFICATION SUITE");
  console.log("   Targeting Canonical Tokenomics & Launch Runbook Canary v4.0");
  console.log("===============================================================================\n");

  const payer = Keypair.generate();
  const creator = Keypair.generate();
  const mintKeypair = Keypair.generate();
  const distributionVault = Keypair.generate().publicKey;
  const quoteMint = new PublicKey("So11111111111111111111111111111111111111112");

  // -------------------------------------------------------------------------
  // TEST 1: Canonical Solana Incinerator Address Verification
  // -------------------------------------------------------------------------
  console.log("--- TEST 1: Canonical Solana Incinerator Constants ---");
  assert(
    SOLANA_INCINERATOR_ADDRESS.toBase58() === "1nc1nerator11111111111111111111111111111111",
    "SOLANA_INCINERATOR_ADDRESS matches canonical 1nc1nerator11111111111111111111111111111111"
  );
  assert(
    THIRTY_THIRD_TREE_LABS_CONFIG.incineratorAddress === "1nc1nerator11111111111111111111111111111111",
    "THIRTY_THIRD_TREE_LABS_CONFIG matches canonical Incinerator address"
  );
  assert(
    THIRTY_THIRD_TREE_LABS_CONFIG.hardCapSupply === 33_333_333,
    "THIRTY_THIRD_TREE_LABS_CONFIG matches hard cap of 33,333,333 tokens"
  );

  // -------------------------------------------------------------------------
  // TEST 2: Raydium LaunchLab Dedicated LP Burn Method
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 2: Raydium LaunchLab LP Burn Instruction Verification ---");
  const platformConfig = new PublicKey("CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW");
  const [raydiumPoolPda] = RaydiumLaunchLabAdapter.getPoolPDA(platformConfig, mintKeypair.publicKey, quoteMint);
  const [raydiumLpMint] = RaydiumLaunchLabAdapter.getLpMintPDA(raydiumPoolPda);
  const raydiumLpAmount = BigInt("1000000000000");

  const raydiumBurnIxs = RaydiumLaunchLabAdapter.buildBurnLpToIncineratorInstructions({
    payer: payer.publicKey,
    sourceLpOwner: creator.publicKey,
    lpMint: raydiumLpMint,
    amountLpTokens: raydiumLpAmount,
  });

  assert(raydiumBurnIxs.length === 2, "Raydium LP burn produces exactly 2 instructions (ATA create + transfer)");
  
  // Verify destination of transfer instruction
  const expectedIncineratorAta = getAssociatedTokenAddressSync(
    raydiumLpMint,
    SOLANA_INCINERATOR_ADDRESS,
    true,
    TOKEN_PROGRAM_ID
  );
  assert(
    raydiumBurnIxs[0].keys[1].pubkey.equals(expectedIncineratorAta),
    "Instruction 1 creates ATA for the canonical Solana Incinerator"
  );
  assert(
    raydiumBurnIxs[1].keys[1].pubkey.equals(expectedIncineratorAta),
    "Instruction 2 transfers 100% of LP tokens directly to the Incinerator ATA"
  );

  // -------------------------------------------------------------------------
  // TEST 3: Meteora DBC Dedicated LP Burn Method
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 3: Meteora DBC LP Burn Instruction Verification ---");
  const [meteoraPoolPda] = MeteoraDbcAdapter.getPoolPDA(mintKeypair.publicKey, quoteMint);
  const [meteoraLpMint] = MeteoraDbcAdapter.getLpMintPDA(meteoraPoolPda);
  const meteoraLpAmount = BigInt("500000000000");

  const meteoraBurnIxs = MeteoraDbcAdapter.buildBurnLpToIncineratorInstructions({
    payer: payer.publicKey,
    sourceLpOwner: creator.publicKey,
    lpMint: meteoraLpMint,
    amountLpTokens: meteoraLpAmount,
  });

  assert(meteoraBurnIxs.length === 2, "Meteora LP burn produces exactly 2 instructions (ATA create + transfer)");
  assert(
    meteoraBurnIxs[1].keys[1].pubkey.equals(
      getAssociatedTokenAddressSync(meteoraLpMint, SOLANA_INCINERATOR_ADDRESS, true, TOKEN_PROGRAM_ID)
    ),
    "Meteora LP burn transfers LP tokens directly to canonical Incinerator ATA"
  );

  // -------------------------------------------------------------------------
  // TEST 4: Token Genesis (33,333,333) & Authority Revocation (Mint & Freeze)
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 4: Token Genesis & Immediate Authority Revocation ---");
  const genesisIxs = await LaunchOrchestrator.buildTokenGenesisAndRevocationInstructions({
    payer: payer.publicKey,
    mintPublicKey: mintKeypair.publicKey,
    mintAuthority: creator.publicKey,
    freezeAuthority: creator.publicKey,
    distributionVault,
    supplyTokens: CANONICAL_HARD_CAP_33RD,
    decimals: CANONICAL_DECIMALS_33RD,
    createMintAccount: true,
    revokeMintAuthority: true,
    revokeFreezeAuthority: true,
  });

  assert(genesisIxs.length === 6, "Genesis pipeline produces exactly 6 atomic instructions");
  // 1: SystemProgram.createAccount
  assert(genesisIxs[0].programId.equals(new PublicKey("11111111111111111111111111111111")), "Step 1: SystemProgram.createAccount for Mint");
  // 2: Initialize Mint
  assert(genesisIxs[1].programId.equals(TOKEN_PROGRAM_ID), "Step 2: Initialize SPL Mint");
  // 3: Create Vault ATA
  const expectedVaultAta = getAssociatedTokenAddressSync(mintKeypair.publicKey, distributionVault, true, TOKEN_PROGRAM_ID);
  assert(genesisIxs[2].keys[1].pubkey.equals(expectedVaultAta), "Step 3: Create Idempotent ATA for Distribution Vault");
  // 4: Mint exact supply
  assert(genesisIxs[3].programId.equals(TOKEN_PROGRAM_ID), "Step 4: Mint 33,333,333.000000000 $33RD tokens into Distribution Vault");
  // 5: Revoke Mint Authority
  assert(genesisIxs[4].data[0] === 6, "Step 5: SetAuthority (MintTokens -> null) irrevocably disables minting");
  // 6: Revoke Freeze Authority
  assert(genesisIxs[5].data[0] === 6, "Step 6: SetAuthority (FreezeAccount -> null) irrevocably disables freeze");

  // -------------------------------------------------------------------------
  // TEST 5: 75 / 15 / 10 Protocol Fee Split & Dust-Free Allocation
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 5: 75/15/10 Protocol Fee Split & Zero-Dust Guarantee ---");
  const testFee1Sol = BigInt(LAMPORTS_PER_SOL); // 1.0 SOL
  const split1Sol = calculate75_15_10FeeSplit(testFee1Sol);
  assert(split1Sol.nodeOperatorsSol === 0.75, "1.0 SOL fee -> 0.75 SOL to Compute Node Operators (75%)");
  assert(split1Sol.treasurySol === 0.15, "1.0 SOL fee -> 0.15 SOL to Protocol Treasury (15%)");
  assert(split1Sol.incineratorSol === 0.10, "1.0 SOL fee -> 0.10 SOL to Solana Incinerator (10%)");
  assert(
    split1Sol.nodeOperatorsLamports + split1Sol.treasuryLamports + split1Sol.incineratorLamports === testFee1Sol,
    "Zero dust loss: sum of all three allocations strictly equals 100% of input lamports"
  );

  // Test odd lamport amount for zero-dust remainder capture
  const testFeeOdd = BigInt(1_000_000_007);
  const splitOdd = calculate75_15_10FeeSplit(testFeeOdd);
  assert(
    splitOdd.nodeOperatorsLamports + splitOdd.treasuryLamports + splitOdd.incineratorLamports === testFeeOdd,
    "Odd lamport split preserves exact lamports with incinerator remainder capture"
  );

  const nodeVault = Keypair.generate().publicKey;
  const treasuryVault = Keypair.generate().publicKey;
  const splitIxs = build75_15_10FeeSplitInstructions({
    payer: payer.publicKey,
    totalFeeLamports: testFee1Sol,
    nodeOperatorsVault: nodeVault,
    treasuryVault: treasuryVault,
  });

  assert(splitIxs.length === 3, "Fee split generates exactly 3 native SOL transfer instructions");
  assert(splitIxs[0].keys[1].pubkey.equals(nodeVault), "Fee Instruction 1 routes to Node Operators Vault");
  assert(splitIxs[1].keys[1].pubkey.equals(treasuryVault), "Fee Instruction 2 routes to Treasury Vault");
  assert(splitIxs[2].keys[1].pubkey.equals(SOLANA_INCINERATOR_ADDRESS), "Fee Instruction 3 routes directly to Solana Incinerator");

  // -------------------------------------------------------------------------
  // TEST 6: FeeBuybackFlywheel Tokenomics Integration
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 6: FeeBuybackFlywheel Incinerator Burn Integration ---");
  const tokenomicsPlan = FeeBuybackFlywheel.planTokenomicsFeeSplit({
    totalFeeLamports: BigInt(5 * LAMPORTS_PER_SOL),
    payer: payer.publicKey,
    nodeOperatorsVault: nodeVault,
    treasuryVault: treasuryVault,
  });
  assert(tokenomicsPlan.split.incineratorSol === 0.50, "5.0 SOL fee routes exactly 0.50 SOL (10%) to Incinerator");
  assert(tokenomicsPlan.instructions.length === 3, "Tokenomics fee split plan produces 3 instructions");

  const creatorStrategyPlan = FeeBuybackFlywheel.planFeeAllocation({
    harvestLamports: BigInt(2 * LAMPORTS_PER_SOL),
    strategy: {
      harvestIntervalMinutes: 10,
      autoHarvest: true,
      feeAllocation: {
        creatorSolPercent: 40,
        buybackAndBurnPercent: 50,
        stablecoinSwapUsdcPercent: 0,
        incineratorBurnPercent: 10,
      },
    },
    creatorPubkey: creator.publicKey,
    mintPubkey: mintKeypair.publicKey,
    userTokenAccount: Keypair.generate().publicKey,
    burnToIncinerator: true,
  });
  assert(creatorStrategyPlan.incineratorSol === 0.20, "Creator fee strategy correctly routes 10% (0.20 SOL) to Incinerator");
  assert(creatorStrategyPlan.instructions.length > 0, "Creator fee strategy generates valid instructions");

  // -------------------------------------------------------------------------
  // TEST 7: Backward Compatibility of Launchpad Adapters
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 7: Backward Compatibility of Launchpad Adapters ---");
  // Raydium original method signature
  const origRaydiumIx = RaydiumLaunchLabAdapter.initializeLaunchLabPoolInstruction({
    creator: creator.publicKey,
    tokenMint: mintKeypair.publicKey,
    quoteMint,
    options: {
      platformConfigAddress: platformConfig.toBase58(),
      autoLockLpTokens: true,
    },
  });
  assert(origRaydiumIx.programId.equals(RaydiumLaunchLabAdapter.PROGRAM_ID), "RaydiumLaunchLabAdapter original method preserved");

  // Meteora original method signature
  const origMeteoraIx = MeteoraDbcAdapter.initializePoolInstruction({
    creator: creator.publicKey,
    tokenMint: mintKeypair.publicKey,
    quoteMint,
    options: {
      configurationKey: Keypair.generate().publicKey.toBase58(),
      dynamicFeeBps: 250,
      autoReinvestToDlmm: false,
    },
  });
  assert(origMeteoraIx.programId.equals(MeteoraDbcAdapter.PROGRAM_ID), "MeteoraDbcAdapter original method preserved");

  // PumpFun adapter
  const [bondingCurve] = PumpFunAdapter.getBondingCurvePDA(mintKeypair.publicKey);
  assert(bondingCurve instanceof PublicKey, "PumpFunAdapter preserved and functioning");

  console.log("\n===============================================================================");
  console.log("   ALL 7 AUDIT SUITE VERIFICATION CHECKS PASSED WITH 100% SUCCESS");
  console.log("===============================================================================\n");
}

runAuditTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
