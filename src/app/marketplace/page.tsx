import Link from "next/link";

export default function MarketplacePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="rounded-2xl border border-[#1A1C25] bg-[#0E0F14] p-8 sm:p-10 space-y-6">
        <span className="inline-flex text-[10px] font-mono font-bold tracking-wider px-2 py-1 rounded bg-[#14151C] text-[#8E9AA8] border border-[#1C1E28]">
          COMING SOON
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-[#F8FAFC]">
            Warmed wallet marketplace
          </h1>
          <p className="text-sm text-[#8E9AA8] leading-relaxed max-w-xl">
            The shop stays closed until wallets can be preloaded with SOL. There is no inventory to buy, and no checkout.
          </p>
        </div>
        <div className="rounded-xl border border-[#1A1C25] bg-[#08090C] p-4 text-[12px] text-[#C5CDD8] leading-relaxed">
          Your own wallets still fund from the Funder. Aged wallets return here after the preload is funded.
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="h-10 px-4 rounded-lg bg-[#FF3E00] text-black text-xs font-bold flex items-center"
          >
            Back to dashboard
          </Link>
          <Link
            href="/funder"
            className="h-10 px-4 rounded-lg border border-[#222432] text-[#F8FAFC] text-xs font-medium flex items-center hover:border-[#FF3E00]"
          >
            Fund your wallets
          </Link>
        </div>
      </div>
    </div>
  );
}
