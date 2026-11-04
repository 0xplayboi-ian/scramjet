import { NextResponse } from "next/server";
import bs58 from "bs58";
import { fetchPresaleTransaction, syncPresaleFromChain } from "../../../../lib/presale/chain";
import { readPresaleLedger, updatePresaleLedger } from "../../../../lib/presale/ledger";
import { mergePresaleSales, presaleTotals, presaleVaultAddress } from "../../../../lib/presale/protocol";

export const runtime = "nodejs";

function publicLedger(ledger: Awaited<ReturnType<typeof readPresaleLedger>>, warning: string | null) {
  return {
    vault: ledger.vault,
    memo: "SCRAMJET:PRESALE:v1",
    seat: "block-0 bundle",
    minimumSol: "0.05",
    totals: presaleTotals(ledger.sales),
    sales: ledger.sales,
    historyComplete: ledger.historyComplete,
    updatedAt: ledger.updatedAt,
    warning,
  };
}

async function refreshLedger() {
  const current = await readPresaleLedger();
  const vault = presaleVaultAddress();
  try {
    const synced = await syncPresaleFromChain({ ...current, vault });
    return await updatePresaleLedger((ledger) => ({
      ...ledger,
      vault,
      newestScanned: synced.newestScanned ?? ledger.newestScanned,
      oldestScanned: synced.oldestScanned ?? ledger.oldestScanned,
      historyComplete: synced.historyComplete,
      sales: mergePresaleSales(ledger.sales, synced.sales),
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Treasury sync failed";
    return { ledger: { ...current, vault }, warning: message };
  }
}

export async function GET() {
  const refreshed = await refreshLedger();
  if ("warning" in refreshed) {
    return NextResponse.json(publicLedger(refreshed.ledger, refreshed.warning));
  }
  return NextResponse.json(publicLedger(refreshed, null));
}

export async function POST(request: Request) {
  let body: { signature?: unknown };
  try {
    body = (await request.json()) as { signature?: unknown };
  } catch {
    return NextResponse.json({ error: "Presale confirmation must be JSON" }, { status: 400 });
  }

  const signature = typeof body.signature === "string" ? body.signature.trim() : "";
  try {
    if (bs58.decode(signature).length !== 64) throw new Error("bad signature");
  } catch {
    return NextResponse.json({ error: "Transaction signature is invalid" }, { status: 400 });
  }

  const vault = presaleVaultAddress();
  try {
    const sale = await fetchPresaleTransaction(signature, vault);
    const ledger = await updatePresaleLedger((current) => ({
      ...current,
      vault,
      newestScanned: current.newestScanned,
      sales: mergePresaleSales(current.sales, [sale]),
    }));
    return NextResponse.json({ ok: true, sale, totals: presaleTotals(ledger.sales) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Presale could not be verified";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
