"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { SCRAMJET_BRAND } from "../lib/constants";
import { calculateUpfrontLaunchFee } from "../lib/feeRouter";
import { withSolanaRpc } from "../lib/solana/connection";
import { useLaunchStore } from "../lib/stores/useLaunchStore";
import type { SolanaLaunchpad } from "../types";

const DRAFT_KEY = "scramjet.launchDraft.v1";
const MIN_WALLET_SOL = 0.01;

const PAD_LABEL: Record<SolanaLaunchpad, string> = {
  PUMP_FUN: "Pump.fun",
  METEORA_DBC: "Meteora DBC",
  RAYDIUM_LAUNCHLAB: "Raydium LaunchLab",
  BAGS: "Bags",
  LETS_BONK: "LetsBonk",
  STONK_FUN: "Stonk.fun",
  PRINTR: "Printr",
  ANONCOIN: "Anoncoin",
  SURGE: "Surge",
  STOXES: "Stoxes",
  LESGO: "Pangea",
  MEME_FUN: "meme.fun",
};

type LaunchDraft = {
  tokenName: string;
  tokenSymbol: string;
  launchpad: SolanaLaunchpad | null;
  holderCount: number;
  devBuyPercent: number;
};

function readDraft(): LaunchDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LaunchDraft>;
    const tokenName = typeof parsed.tokenName === "string" ? parsed.tokenName.trim() : "";
    const tokenSymbol = typeof parsed.tokenSymbol === "string" ? parsed.tokenSymbol.trim() : "";
    if (!tokenName && !tokenSymbol) return null;
    return {
      tokenName,
      tokenSymbol,
      launchpad: parsed.launchpad ?? null,
      holderCount: Number(parsed.holderCount) || 0,
      devBuyPercent: Number(parsed.devBuyPercent) || 0,
    };
  } catch {
    return null;
  }
}

function sol(value: number): string {
  return `${value.toFixed(value >= 10 ? 2 : 4)} SOL`;
}

function shortKey(value: string): string {
  return value.length > 12 ? `${value.slice(0, 4)}…${value.slice(-4)}` : value;
}

export default function DashboardPage() {
  const connectedWallet = useLaunchStore((state) => state.connectedWallet);
  const masterBalanceSol = useLaunchStore((state) => state.masterBalanceSol);
  const config = useLaunchStore((state) => state.activeLaunchConfig);
  const subWallets = useLaunchStore((state) => state.subWallets);
  const folders = useLaunchStore((state) => state.folders);
  const automations = useLaunchStore((state) => state.activeAutomations);
  const reclaimedRentSol = useLaunchStore((state) => state.reclaimedRentSol);
  const lastActionMessage = useLaunchStore((state) => state.lastActionMessage);
  const refreshWalletBalances = useLaunchStore((state) => state.refreshWalletBalances);

  const [draft, setDraft] = useState<LaunchDraft | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [slotState, setSlotState] = useState<"loading" | "live" | "unavailable">("loading");

  useEffect(() => {
    setDraft(readDraft());
    void refreshWalletBalances();
    let cancel = false;
    withSolanaRpc((connection) => connection.getSlot("confirmed"))
      .then((value) => {
        if (cancel) return;
        setSlot(value);
        setSlotState("live");
      })
      .catch(() => {
        if (!cancel) setSlotState("unavailable");
      });
    return () => {
      cancel = true;
    };
  }, [refreshWalletBalances]);

  const cohortSol = subWallets.reduce((sum, wallet) => sum + wallet.balanceSol, 0);
  const thinWallets = [...subWallets]
    .filter((wallet) => wallet.balanceSol < MIN_WALLET_SOL)
    .sort((a, b) => a.balanceSol - b.balanceSol);
  const fundedCount = subWallets.filter((wallet) => wallet.balanceSol >= MIN_WALLET_SOL).length;
  const statusCounts = subWallets.reduce<Record<string, number>>((counts, wallet) => {
    counts[wallet.status] = (counts[wallet.status] ?? 0) + 1;
    return counts;
  }, {});
  const upfront = calculateUpfrontLaunchFee(subWallets.length, connectedWallet);
  const pad = PAD_LABEL[config.launchpad] ?? config.launchpad;

  const nextStep = !connectedWallet
    ? "Connect a wallet. Master SOL stays at zero until the wallet is on this page."
    : thinWallets.length > 0
      ? `${thinWallets.length} cohort wallet${thinWallets.length === 1 ? "" : "s"} sit under the 0.01 SOL minimum.`
      : draft
        ? `Resume ${draft.tokenName || draft.tokenSymbol}. The draft is saved in this browser.`
        : "Cohort clears the 0.01 SOL minimum. Open the terminal or start a launch.";

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 data-testid="dashboard-title" className="text-[22px] font-semibold tracking-tight text-[#F8FAFC]">
            Dashboard
          </h1>
          <p data-testid="dashboard-next" className="text-[13px] text-[#8E9AA8] max-w-xl">
            {nextStep}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/launch"
            className="h-9 px-4 rounded-lg bg-[#FF3E00] text-black text-xs font-bold flex items-center"
          >
            {draft ? "Resume launch" : "Create launch"}
          </Link>
          <Link
            href="/workspace"
            className="h-9 px-4 rounded-lg border border-[#222432] text-[#F8FAFC] text-xs font-medium flex items-center hover:border-[#31E3AC]"
          >
            Live terminal
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat
          label="Master wallet"
          value={connectedWallet ? sol(masterBalanceSol) : "Not connected"}
          detail={connectedWallet ? shortKey(connectedWallet.toBase58()) : "Connect to read SOL"}
        />
        <Stat
          label="Cohort SOL"
          value={sol(cohortSol)}
          detail={`${fundedCount}/${subWallets.length} wallets at or above 0.01`}
        />
        <Stat
          label="Slot"
          value={slotState === "live" && slot !== null ? slot.toLocaleString() : slotState === "unavailable" ? "Unavailable" : "Reading"}
          detail={slotState === "unavailable" ? "Mainnet RPC did not answer" : "Confirmed mainnet slot"}
        />
        <Stat
          label="Upfront launch fee"
          value={`${upfront.totalLaunchFeeSol.toFixed(3)} SOL`}
          detail={`${subWallets.length} wallets · sells ${SCRAMJET_BRAND.feePercent}%`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2 rounded-xl border border-[#1A1C25] bg-[#0E0F14] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-mono uppercase tracking-wider text-[#717686]">Active launch</h2>
            <span className="text-[10px] font-mono text-[#31E3AC]">
              {config.launchMode === "BLOCK_0" ? "Block-0" : config.launchMode.replaceAll("_", " ")}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-[#F8FAFC]">
                {config.tokenName} <span className="text-[#8E9AA8] font-mono text-sm">${config.tokenSymbol}</span>
              </div>
              <div className="text-[12px] text-[#8E9AA8] mt-1">{pad}</div>
            </div>
            <div className="text-right font-mono text-[12px] text-[#C5CDD8]">
              <div>Dev buy {config.devBuySol.toFixed(2)} SOL</div>
              <div>Tip {config.block0Config.customJitoTipSol.toFixed(3)} SOL</div>
            </div>
          </div>
          {draft && (
            <div data-testid="dashboard-draft" className="rounded-lg border border-[#1D3256] bg-[#10192A] px-3 py-2 text-[12px] text-[#93C5FD]">
              Browser draft: {draft.tokenName || "Untitled"}
              {draft.tokenSymbol ? ` ($${draft.tokenSymbol})` : ""}
              {draft.launchpad ? ` · ${PAD_LABEL[draft.launchpad] ?? draft.launchpad}` : ""}
              {draft.holderCount ? ` · ${draft.holderCount} holders` : ""}
              {draft.devBuyPercent ? ` · ${draft.devBuyPercent}% dev` : ""}
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <Mini label="Sniper guard" value={automations.sniperGuard.enabled ? "On" : "Off"} />
            <Mini label="Bump bot" value={automations.bumpBot.running ? "Running" : automations.bumpBot.enabled ? "Armed" : "Off"} />
            <Mini label="Green TWAP" value={automations.greenTwap.running ? "Running" : "Off"} />
          </div>
          {lastActionMessage && (
            <p className="text-[11px] text-[#8E9AA8] font-mono">{lastActionMessage}</p>
          )}
        </section>

        <section className="rounded-xl border border-[#1A1C25] bg-[#0E0F14] p-5 space-y-3">
          <h2 className="text-[11px] font-mono uppercase tracking-wider text-[#717686]">Folders</h2>
          <ul className="space-y-2">
            {folders.map((folder) => (
              <li key={folder.id} className="flex items-center justify-between text-[12px]">
                <span className="text-[#F8FAFC]">{folder.name}</span>
                <span className="font-mono text-[#8E9AA8]">
                  {folder.walletCount} · {folder.totalBalanceSol.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="pt-2 border-t border-[#1A1C25] flex justify-between text-[11px] font-mono text-[#8E9AA8]">
            <span>Rent reclaimed</span>
            <span className="text-[#31E3AC]">{reclaimedRentSol.toFixed(4)} SOL</span>
          </div>
          <Link href="/funder" className="block text-[12px] text-[#FF3E00] hover:underline">
            Open funder
          </Link>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2 rounded-xl border border-[#1A1C25] bg-[#0E0F14] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-mono uppercase tracking-wider text-[#717686]">Cohort wallets</h2>
            <div className="flex gap-3 text-[10px] font-mono text-[#8E9AA8]">
              {Object.entries(statusCounts).map(([status, count]) => (
                <span key={status}>
                  {status} {count}
                </span>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="text-[10px] font-mono uppercase text-[#717686]">
                <tr>
                  <th className="py-2 pr-3 font-medium">Role</th>
                  <th className="py-2 pr-3 font-medium">Address</th>
                  <th className="py-2 pr-3 font-medium">SOL</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {subWallets.map((wallet) => (
                  <tr key={wallet.id} className="border-t border-[#1A1C25]">
                    <td className="py-2 pr-3 text-[#F8FAFC]">{wallet.role.replaceAll("_", " ")}</td>
                    <td className="py-2 pr-3 font-mono text-[#8E9AA8]">{shortKey(wallet.publicKey)}</td>
                    <td className={`py-2 pr-3 font-mono ${wallet.balanceSol < MIN_WALLET_SOL ? "text-[#E2B340]" : "text-[#F8FAFC]"}`}>
                      {wallet.balanceSol.toFixed(4)}
                    </td>
                    <td className="py-2 text-[#8E9AA8]">{wallet.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-[#1C1E28] bg-[#101114] p-5 space-y-3">
          <span className="inline-flex text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-[#14151C] text-[#8E9AA8] border border-[#1C1E28]">
            COMING SOON
          </span>
          <h2 className="text-sm font-semibold text-[#F8FAFC]">Marketplace</h2>
          <p className="text-[12px] text-[#8E9AA8] leading-relaxed">
            Warmed wallets stay off the shelf until they can be preloaded with SOL. Your own cohort still funds from the Funder.
          </p>
          <Link href="/marketplace" className="text-[12px] text-[#8E9AA8] hover:text-[#F8FAFC]">
            Read the notice
          </Link>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-[#1A1C25] bg-[#0E0F14] p-4 space-y-1">
      <div className="text-[10px] font-mono uppercase tracking-wider text-[#717686]">{label}</div>
      <div className="text-[15px] font-semibold text-[#F8FAFC]">{value}</div>
      <div className="text-[11px] text-[#8E9AA8]">{detail}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#1A1C25] bg-[#08090C] px-3 py-2">
      <div className="text-[10px] font-mono text-[#717686]">{label}</div>
      <div className="text-[12px] text-[#F8FAFC] mt-0.5">{value}</div>
    </div>
  );
}
