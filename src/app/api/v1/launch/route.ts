import { NextRequest, NextResponse } from "next/server";
import { AutopilotLauncher } from "../../../../lib/pipeline/autopilotLauncher";
import { calculateUpfrontLaunchFee } from "../../../../lib/feeRouter";
import { DEFAULT_PLATFORM_FEE_VAULT } from "../../../../lib/constants";

const MAX_TOKEN_NAME = 32;
const MAX_TOKEN_SYMBOL = 10;
const MAX_BUDGET_SOL = 10_000;

/**
 * Unauthenticated quote. The caller-supplied payer is ignored: this route
 * cannot tell a wallet address from a claim, and the platform vault address
 * is public. Fee exemption is applied only when that vault actually signs.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Request body must be a JSON object" }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const tokenName = typeof record.tokenName === "string" ? record.tokenName.trim() : "";
  const tokenSymbol = typeof record.tokenSymbol === "string" ? record.tokenSymbol.trim() : "";
  if (
    !tokenName ||
    !tokenSymbol ||
    tokenName.length > MAX_TOKEN_NAME ||
    tokenSymbol.length > MAX_TOKEN_SYMBOL
  ) {
    return NextResponse.json(
      { error: `tokenName (1-${MAX_TOKEN_NAME}) and tokenSymbol (1-${MAX_TOKEN_SYMBOL}) are required` },
      { status: 400 }
    );
  }

  const rawBudget = record.totalBudgetSol;
  const budget = rawBudget === undefined ? 5 : Number(rawBudget);
  if (!Number.isFinite(budget) || budget <= 0 || budget > MAX_BUDGET_SOL) {
    return NextResponse.json(
      { error: `totalBudgetSol must be greater than 0 and at most ${MAX_BUDGET_SOL}` },
      { status: 400 }
    );
  }

  const launchpad =
    typeof record.launchpad === "string" && record.launchpad.trim().length > 0 && record.launchpad.length <= 32
      ? record.launchpad.trim()
      : "PUMP_FUN";

  try {
    const allocation = AutopilotLauncher.calculateAutopilotAllocation(budget, "PROVEN_VOLUME");
    const fee = calculateUpfrontLaunchFee(allocation.subWalletCount);

    return NextResponse.json({
      status: "QUOTED",
      launchConfig: {
        tokenName,
        tokenSymbol,
        launchpad,
        allocation,
        feeEstimate: {
          baseFeeSol: fee.baseFeeSol,
          walletExecutionFeeSol: fee.walletExecutionFeeSol,
          totalLaunchFeeSol: fee.totalLaunchFeeSol,
          totalLaunchFeeLamports: fee.totalLaunchFeeLamports.toString(),
          walletCount: fee.walletCount,
        },
        platformFeeVault: DEFAULT_PLATFORM_FEE_VAULT.toBase58(),
        isExempt: false,
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not build a launch quote" }, { status: 500 });
  }
}
