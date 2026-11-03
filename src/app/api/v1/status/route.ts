import { NextResponse } from "next/server";
import { JITO_BLOCK_ENGINE_URLS, PROTOCOL_FEE_BPS } from "../../../../lib/constants";

/**
 * Process liveness only. Inclusion rate, uptime, and engine latency are not
 * measured here, so this route does not invent them.
 */
export async function GET() {
  return NextResponse.json({
    status: "OPERATIONAL",
    network: process.env.NEXT_PUBLIC_SOLANA_NETWORK || process.env.SOLANA_NETWORK || "solana-mainnet",
    version: "1.0.0-MAINNET-BETA",
    jitoBlockEngines: JITO_BLOCK_ENGINE_URLS.map((url) => ({ url })),
    feePolicy: {
      standardFeeBps: PROTOCOL_FEE_BPS,
      standardFeePercent: "3.5%",
    },
  });
}
