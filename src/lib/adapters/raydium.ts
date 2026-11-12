import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { RaydiumLaunchLabOptions } from "../../types";
import { SOLANA_INCINERATOR_ADDRESS } from "../constants";
import { LpBurner } from "../solana/lpBurner";

export class RaydiumLaunchLabAdapter {
  // Raydium LaunchLab / CPMM Program ID
  public static readonly PROGRAM_ID = new PublicKey(
    "CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW"
  );

  // Canonical Solana Incinerator address for permanent LP destruction
  public static readonly CANONICAL_INCINERATOR = SOLANA_INCINERATOR_ADDRESS;

  /**
   * Derives Raydium CPMM Pool Authority PDA
   */
  public static getPoolAuthority(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("vault_and_lp_mint_auth_seed")],
      this.PROGRAM_ID
    );
  }

  /**
   * Derives Raydium CPMM Pool State PDA
   */
  public static getPoolPDA(
    platformConfig: PublicKey,
    tokenMintA: PublicKey,
    tokenMintB: PublicKey
  ): [PublicKey, number] {
    // Sort mints deterministically
    const [token0, token1] =
      Buffer.compare(tokenMintA.toBuffer(), tokenMintB.toBuffer()) < 0
        ? [tokenMintA, tokenMintB]
        : [tokenMintB, tokenMintA];

    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("pool"),
        platformConfig.toBuffer(),
        token0.toBuffer(),
        token1.toBuffer(),
      ],
      this.PROGRAM_ID
    );
  }

  /**
   * Derives LP mint PDA for a Raydium CPMM pool
   */
  public static getLpMintPDA(poolPda: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("pool_lp_mint"), poolPda.toBuffer()],
      this.PROGRAM_ID
    );
  }

  /**
   * Initializes LaunchLab pool under a platform config
   */
  public static initializeLaunchLabPoolInstruction(params: {
    creator: PublicKey;
    tokenMint: PublicKey;
    quoteMint: PublicKey;
    options: RaydiumLaunchLabOptions;
  }): TransactionInstruction {
    const platformConfig = new PublicKey(params.options.platformConfigAddress);
    const [auth] = this.getPoolAuthority();

    const discriminator = Buffer.from([143, 37, 222, 96, 160, 102, 171, 62]);
    const data = Buffer.alloc(8 + 1);
    discriminator.copy(data, 0);
    data.writeUInt8(params.options.autoLockLpTokens ? 1 : 0, 8);

    return new TransactionInstruction({
      programId: this.PROGRAM_ID,
      keys: [
        { pubkey: params.creator, isSigner: true, isWritable: true },
        { pubkey: platformConfig, isSigner: false, isWritable: false },
        { pubkey: auth, isSigner: false, isWritable: false },
        { pubkey: params.tokenMint, isSigner: false, isWritable: false },
        { pubkey: params.quoteMint, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    });
  }

  /**
   * Builds dedicated instruction sequence to permanently burn 100% of LP tokens
   * to the canonical Solana Incinerator address (1nc1nerator11111111111111111111111111111111).
   */
  public static buildBurnLpToIncineratorInstructions(params: {
    payer: PublicKey;
    sourceLpOwner: PublicKey;
    lpMint: PublicKey;
    amountLpTokens: bigint | number;
    tokenProgramId?: PublicKey;
    incineratorAddress?: PublicKey;
  }): TransactionInstruction[] {
    return LpBurner.buildBurnLpToIncineratorInstructions({
      payer: params.payer,
      sourceLpOwner: params.sourceLpOwner,
      lpMint: params.lpMint,
      amountLpTokens: params.amountLpTokens,
      tokenProgramId: params.tokenProgramId || TOKEN_PROGRAM_ID,
      incineratorAddress: params.incineratorAddress || this.CANONICAL_INCINERATOR,
    });
  }

  /**
   * Helper that builds the pool initialization instruction and immediately sequences
   * the transfer of 100% LP tokens to the Solana Incinerator address.
   */
  public static buildInitializeAndBurnLpInstructions(params: {
    creator: PublicKey;
    tokenMint: PublicKey;
    quoteMint: PublicKey;
    options: RaydiumLaunchLabOptions;
    lpTokenAmount: bigint | number;
    tokenProgramId?: PublicKey;
  }): TransactionInstruction[] {
    const initIx = this.initializeLaunchLabPoolInstruction({
      creator: params.creator,
      tokenMint: params.tokenMint,
      quoteMint: params.quoteMint,
      options: params.options,
    });

    const platformConfig = new PublicKey(params.options.platformConfigAddress);
    const [poolPda] = this.getPoolPDA(platformConfig, params.tokenMint, params.quoteMint);
    const [lpMint] = this.getLpMintPDA(poolPda);

    const burnIxs = this.buildBurnLpToIncineratorInstructions({
      payer: params.creator,
      sourceLpOwner: params.creator,
      lpMint,
      amountLpTokens: params.lpTokenAmount,
      tokenProgramId: params.tokenProgramId,
    });

    return [initIx, ...burnIxs];
  }
}
