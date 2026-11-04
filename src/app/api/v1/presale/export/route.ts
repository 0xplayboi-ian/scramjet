import { NextResponse } from "next/server";
import { syncPresaleFromChain } from "../../../../../lib/presale/chain";
import { readPresaleLedger, updatePresaleLedger } from "../../../../../lib/presale/ledger";
import { mergePresaleSales, presaleCsv, presaleVaultAddress } from "../../../../../lib/presale/protocol";

export const runtime = "nodejs";

export async function GET() {
  const vault = presaleVaultAddress();
  let ledger = await readPresaleLedger();
  try {
    const synced = await syncPresaleFromChain({ ...ledger, vault });
    ledger = await updatePresaleLedger((current) => ({
      ...current,
      vault,
      newestScanned: synced.newestScanned ?? current.newestScanned,
      oldestScanned: synced.oldestScanned ?? current.oldestScanned,
      historyComplete: synced.historyComplete,
      sales: mergePresaleSales(current.sales, synced.sales),
    }));
  } catch {
    ledger = { ...ledger, vault };
  }

  return new NextResponse(presaleCsv(ledger.sales), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"scram-presale-block0-seats.csv\"",
    },
  });
}
