import { promises as fs } from "fs";
import path from "path";
import type { PresaleSale } from "./protocol";
import { mergePresaleSales, presaleVaultAddress } from "./protocol";

export interface PresaleLedger {
  version: 1;
  vault: string;
  /** Newest signature already inspected. Later syncs stop when they reach it. */
  newestScanned: string | null;
  /** Oldest signature already inspected while walking backward. */
  oldestScanned: string | null;
  historyComplete: boolean;
  updatedAt: string | null;
  sales: PresaleSale[];
}

const EMPTY = (): PresaleLedger => ({
  version: 1,
  vault: presaleVaultAddress(),
  newestScanned: null,
  oldestScanned: null,
  historyComplete: false,
  updatedAt: null,
  sales: [],
});

function ledgerPath(): string {
  return path.join(process.cwd(), "data", "presale-ledger.json");
}

let writeChain: Promise<unknown> = Promise.resolve();

function withLedgerLock<T>(operation: () => Promise<T>): Promise<T> {
  const run = writeChain.then(operation, operation);
  writeChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function isSale(value: unknown): value is PresaleSale {
  if (!value || typeof value !== "object") return false;
  const sale = value as Partial<PresaleSale>;
  return (
    typeof sale.signature === "string" &&
    typeof sale.buyer === "string" &&
    typeof sale.lamports === "number" &&
    Number.isFinite(sale.lamports)
  );
}

export function emptyPresaleLedger(): PresaleLedger {
  return EMPTY();
}

export function normalizePresaleLedger(value: unknown): PresaleLedger {
  if (!value || typeof value !== "object") return EMPTY();
  const record = value as Partial<PresaleLedger>;
  const sales = Array.isArray(record.sales) ? record.sales.filter(isSale) : [];
  return {
    version: 1,
    vault: typeof record.vault === "string" && record.vault ? record.vault : presaleVaultAddress(),
    newestScanned: typeof record.newestScanned === "string" ? record.newestScanned : null,
    oldestScanned: typeof record.oldestScanned === "string" ? record.oldestScanned : null,
    historyComplete: record.historyComplete === true,
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : null,
    sales: mergePresaleSales(sales, []),
  };
}

export async function readPresaleLedger(): Promise<PresaleLedger> {
  try {
    const raw = await fs.readFile(ledgerPath(), "utf8");
    return normalizePresaleLedger(JSON.parse(raw));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return EMPTY();
    throw error;
  }
}

export async function writePresaleLedger(ledger: PresaleLedger): Promise<void> {
  const file = ledgerPath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  const next: PresaleLedger = {
    ...ledger,
    version: 1,
    sales: mergePresaleSales(ledger.sales, []),
    updatedAt: new Date().toISOString(),
  };
  const temporary = `${file}.${process.pid}.tmp`;
  await fs.writeFile(temporary, JSON.stringify(next, null, 2));
  await fs.rename(temporary, file);
}

export async function updatePresaleLedger(
  mutate: (ledger: PresaleLedger) => PresaleLedger | Promise<PresaleLedger>
): Promise<PresaleLedger> {
  return withLedgerLock(async () => {
    const current = await readPresaleLedger();
    const next = await mutate(current);
    await writePresaleLedger(next);
    return readPresaleLedger();
  });
}
