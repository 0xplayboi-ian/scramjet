import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { MeteoraDbcOptions } from "../../types";
import { SOLANA_INCINERATOR_ADDRESS } from "../constants";
import { LpBurner } from "../solana/lpBurner";

export class MeteoraDbcAdapter {
  // Official Meteora DBC Program ID on Solana Mainnet
  public static readonly PROGRAM_ID = new PublicKey(
    "Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB"
  );

  // Canonical Solana Incinerator address for permanent LP destruction
  public static readonly CANONICAL_INCINERATOR = SOLANA_INCINERATOR_ADDRESS;

  /**
   * Derives pool PDA for Meteora Dynamic Curve
   */
  public static getPoolPDA(mintA: PublicKey, mintB: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("dynamic_pool"), mintA.toBuffer(), mintB.toBuffer()],
      this.PROGRAM_ID
    );
  }

  /**
   * Derives LP mint PDA for Meteora Dynamic Curve pool
   */
  public static getLpMintPDA(poolPda: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("lp_mint"), poolPda.toBuffer()],
      this.PROGRAM_ID
    );
  }

  /**
   * Initializes a Dynamic Bonding Curve with custom dynamic fee tiers
   */
  public static initializePoolInstruction(params: {
    creator: PublicKey;
    tokenMint: PublicKey;
    quoteMint: PublicKey; // usually WSOL
    options: MeteoraDbcOptions;
  }): TransactionInstruction {
    const configKey = new PublicKey(params.options.configurationKey);
    const [poolPda] = this.getPoolPDA(params.tokenMint, params.quoteMint);

    const initDiscriminator = Buffer.from([175, 175, 109, 31, 13, 152, 155, 237]);
    const data = Buffer.alloc(8 + 2 + 1);
    initDiscriminator.copy(data, 0);
    data.writeUInt16LE(params.options.dynamicFeeBps, 8);
    data.writeUInt8(params.options.autoReinvestToDlmm ? 1 : 0, 10);

    return new TransactionInstruction({
      programId: this.PROGRAM_ID,
      keys: [
        { pubkey: poolPda, isSigner: false, isWritable: true },
        { pubkey: configKey, isSigner: false, isWritable: false },
        { pubkey: params.creator, isSigner: true, isWritable: true },
        { pubkey: params.tokenMint, isSigner: false, isWritable: true },
        { pubkey: params.quoteMint, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    });
  }

  /**
   * Builds dedicated instruction sequence to permanently burn 100% of Meteora DBC/DLMM LP tokens
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
   * Helper that builds the Meteora pool initialization instruction and immediately sequences
   * the transfer of 100% LP tokens to the Solana Incinerator address.
   */
  public static buildInitializeAndBurnLpInstructions(params: {
    creator: PublicKey;
    tokenMint: PublicKey;
    quoteMint: PublicKey;
    options: MeteoraDbcOptions;
    lpTokenAmount: bigint | number;
    tokenProgramId?: PublicKey;
  }): TransactionInstruction[] {
    const initIx = this.initializePoolInstruction({
      creator: params.creator,
      tokenMint: params.tokenMint,
      quoteMint: params.quoteMint,
      options: params.options,
    });

    const [poolPda] = this.getPoolPDA(params.tokenMint, params.quoteMint);
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
