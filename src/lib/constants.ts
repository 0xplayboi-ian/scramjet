import { PublicKey } from "@solana/web3.js";

export const SCRAMJET_BRAND = {
  name: "SCRAMJET",
  codename: "MACH CASCADE",
  tagline: "Hypersonic Solana Token Launchpad & Creator Fee Protocol",
  version: "1.0.0-MAINNET-BETA",
  feePercent: 3.5, // 3.5% platform fee (undercutting Proxima's 5.0% by 30%)
};

// Official Solana Program IDs
export const PUMP_FUN_PROGRAM_ID = new PublicKey(
  "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
);

export const PUMP_FEE_RECIPIENT = new PublicKey(
  "CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM"
);

// Jito Tip Accounts for Block-0 Bundle inclusion
export const JITO_TIP_ACCOUNTS = [
  new PublicKey("96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5"),
  new PublicKey("HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe"),
  new PublicKey("Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY"),
  new PublicKey("ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49"),
  new PublicKey("DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh"),
  new PublicKey("ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt"),
  new PublicKey("DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL"),
  new PublicKey("3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT"),
];

export const JITO_BLOCK_ENGINE_URLS = [
  "https://frankfurt.mainnet.block-engine.jito.wtf",
  "https://amsterdam.mainnet.block-engine.jito.wtf",
  "https://ny.mainnet.block-engine.jito.wtf",
  "https://tokyo.mainnet.block-engine.jito.wtf",
  "https://slc.mainnet.block-engine.jito.wtf",
];

// Protocol Fee Split (3.5% standard)
export const PROTOCOL_FEE_BPS = 350; // 3.5% = 350 basis points
export const PROXIMA_FEE_BPS = 500;  // 5.0% = 500 basis points (competitor benchmark)

// Default platform fee collection vault
export const DEFAULT_PLATFORM_FEE_VAULT = new PublicKey(
  "CcwpTCpWMtKGo1fqnZuH4Psdj6yugbmSrAPaeTdEy6Qq"
);

// Canonical Solana Incinerator Burn Address (Hard Proof of Locked Liquidity)
export const SOLANA_INCINERATOR_ADDRESS = new PublicKey(
  "1nc1nerator11111111111111111111111111111111"
);
export const SOLANA_INCINERATOR_SOLSCAN =
  "https://solscan.io/account/1nc1nerator11111111111111111111111111111111";

// Protocol Revenue Fee Distribution Architecture (75% Nodes / 15% Treasury / 10% Incinerator)
export const FEE_SPLIT_NODES_PERCENT = 75;
export const FEE_SPLIT_TREASURY_PERCENT = 15;
export const FEE_SPLIT_INCINERATOR_PERCENT = 10;
export const CANONICAL_HARD_CAP_33RD = 33_333_333;
export const CANONICAL_DECIMALS_33RD = 9;

// 33rd Tree Labs Canonical Tokenomics & Singularity Protocol Constants
export const THIRTY_THIRD_TREE_LABS_CONFIG = {
  name: "33rd Tree Labs",
  symbol: "33RD",
  hardCapSupply: 33_333_333,
  decimals: 9,
  website: "https://33rdtreelabs.tech",
  description:
    "A Byzantine-Resilient Verifiable DePIN Compute Fabric on Solana. Hierarchical Tensor Arbor coordination, zero-knowledge neural evaluations, and cryptographic consensus at scale.",
  metadataUri: "https://33rdtreelabs.tech/assets/token_metadata.json",
  imageUrl: "https://33rdtreelabs.tech/assets/official_logo_mark.png",
  incineratorAddress: "1nc1nerator11111111111111111111111111111111",
  incineratorSolscan: "https://solscan.io/account/1nc1nerator11111111111111111111111111111111",
  revokeMintAuthority: true,
  revokeFreezeAuthority: true,
  lpBurnPercent: 100,
  byzantineQuorumNodes: 64,
  unbondingWindowDays: 7,
};
