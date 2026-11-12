"use client";

import React, { useState } from "react";
import { SOLANA_INCINERATOR_ADDRESS, SOLANA_INCINERATOR_SOLSCAN, THIRTY_THIRD_TREE_LABS_CONFIG } from "../../lib/constants";

export interface ChecklistItem {
  id: string;
  milestone: string;
  title: string;
  description: string;
  technicalRef: string;
  completed: boolean;
}

const DEFAULT_RUNBOOK_ITEMS: ChecklistItem[] = [
  {
    id: "t-30-days",
    milestone: "T-30 DAYS",
    title: "Anchor Smart Contract Security Audits",
    description: "Dual-firm review (OtterSec / Halborn). Bit-exact INT8/FP8 CAP-FFN transformer kernels, ZK polynomial verifiers, and Anchor staking programs audited.",
    technicalRef: "Formal verification report on CAP-FFN kernel bit-exactness",
    completed: true,
  },
  {
    id: "t-14-days",
    milestone: "T-14 DAYS",
    title: "Testnet Stress Test with K=64 Byzantine Clusters",
    description: "Halo2-KZG and HyperNova-Plonky3 proof challenges simulated under 33% malicious adversarial fault injection. Stake-weighted committee consensus verified.",
    technicalRef: "64/64 clusters committed slot state at 12.0s cadence",
    completed: true,
  },
  {
    id: "t-7-days",
    milestone: "T-7 DAYS",
    title: "Multi-Sig Key Ceremony (Squads v4)",
    description: "Establish 3-of-5 Ledger hardware multi-sig for Protocol Treasury (5M $33RD) and Ecosystem Grants (5M $33RD) vaults. Streamflow vesting locked.",
    technicalRef: "Squads v4 multi-sig deployed on mainnet-beta",
    completed: true,
  },
  {
    id: "t-3-days",
    milestone: "T-3 DAYS",
    title: "Deploy Official Token Metadata",
    description: "Host metadata.json at official domain https://33rdtreelabs.tech/assets/token_metadata.json with official logo mark #06 wireframe.",
    technicalRef: "Metaplex on-chain metadata URI pointed to 33rdtreelabs.tech",
    completed: true,
  },
  {
    id: "t-24-hrs",
    milestone: "T-24 HRS",
    title: "Pre-Fund Liquidity & RPC Failover Validation",
    description: "Pre-fund deployer wallets and verify connectivity to 5 regional Jito block engines (Frankfurt, Amsterdam, NY, Tokyo, Salt Lake City).",
    technicalRef: "Latency <45ms across block engine endpoints",
    completed: true,
  },
  {
    id: "t-0-hrs",
    milestone: "T-0 HRS",
    title: "Genesis Mint Creation & Authority Revocations",
    description: "Mint exactly 33,333,333 $33RD tokens with 9 decimals. Permanently disable Mint Authority (immutable hard cap) and Freeze Authority (censorship resistance).",
    technicalRef: "spl-token authorize disable mint & freeze executed",
    completed: true,
  },
  {
    id: "t-plus-5-min",
    milestone: "T+5 MIN",
    title: "Permanent 100% LP Token Burn to Solana Incinerator",
    description: "Transfer 100% of DEX LP tokens directly to 1nc1nerator11111111111111111111111111111111. Mathematical proof of locked liquidity verifiable on Solscan.",
    technicalRef: "LP Token -> 1nc1nerator...1111 burn confirmation",
    completed: true,
  },
  {
    id: "t-plus-15-min",
    milestone: "T+15 MIN",
    title: "Enable Anchor Staking Program Deposit",
    description: "Open 25,000 $33RD hardware admission gate for compute clusters. Begin 4-Year geometric halving subsidy distribution.",
    technicalRef: "PDA emissions program active; 15M $33RD locked in vault",
    completed: true,
  },
  {
    id: "t-plus-1-hr",
    milestone: "T+1 HR",
    title: "Verify First 10% Fee Burn Transaction",
    description: "Confirm first automated protocol fee split: 75% Node Operators, 15% Treasury R&D, 10% permanent burn into Solana Incinerator.",
    technicalRef: "On-chain Incinerator transaction receipt indexed",
    completed: true,
  },
];

interface TMinusRunbookDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPreset?: () => void;
}

export const TMinusRunbookDrawer: React.FC<TMinusRunbookDrawerProps> = ({
  isOpen,
  onClose,
  onLoadPreset,
}) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_RUNBOOK_ITEMS);

  const toggleItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const markAllComplete = () => {
    setChecklist((prev) => prev.map((item) => ({ ...item, completed: true })));
  };

  const resetChecklist = () => {
    setChecklist(DEFAULT_RUNBOOK_ITEMS);
  };

  const completedCount = checklist.filter((item) => item.completed).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-xl bg-[#090A0E] border-l border-[#1C202B] text-[#F8FAFC] h-full overflow-y-auto flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="sticky top-0 z-20 bg-[#0C0E14]/95 backdrop-blur border-b border-[#1C202B] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF2424] animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#FF7700] font-bold">
                T-MINUS OPERATIONAL RUNBOOK
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-[#717686] hover:text-white p-1 rounded hover:bg-[#1A1C25] text-lg font-mono leading-none"
              aria-label="Close Drawer"
            >
              ✕
            </button>
          </div>

          <h2 className="text-lg font-bold tracking-tight text-[#F8FAFC] flex items-center gap-2">
            <span>33rd Tree Labs // The Singularity Protocol</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#31E3AC]/15 text-[#31E3AC] border border-[#31E3AC]/30 font-bold">
              CANARY V4.0
            </span>
          </h2>
          <p className="text-xs text-[#8E9AA8] mt-1">
            Deterministic pre-launch verification checklist based on the 33rd Tree Labs Tokenomics Specification.
          </p>

          {/* Progress Bar & Counter */}
          <div className="mt-4 p-3 rounded-lg bg-[#0E1017] border border-[#1C202B] space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#8E9AA8]">
                Readiness Score: <strong className="text-[#31E3AC]">{completedCount}/{checklist.length} Gates Cleared</strong>
              </span>
              <span className="text-[#FF7700] font-bold">{progressPercent}% READY</span>
            </div>
            <div className="w-full h-2 bg-[#141722] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF3E00] via-[#FF7700] to-[#31E3AC] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between gap-2 mt-3 pt-2 text-[11px] font-mono">
            <div className="flex gap-2">
              <button
                onClick={markAllComplete}
                className="text-[#31E3AC] hover:underline"
              >
                Mark All Clear (9/9)
              </button>
              <span className="text-[#2C3140]">&bull;</span>
              <button
                onClick={resetChecklist}
                className="text-[#8E9AA8] hover:text-white hover:underline"
              >
                Reset
              </button>
            </div>

            {onLoadPreset && (
              <button
                onClick={() => {
                  onLoadPreset();
                  onClose();
                }}
                className="px-2.5 py-1 rounded bg-[#FF3E00]/20 hover:bg-[#FF3E00]/30 text-[#FF5500] border border-[#FF3E00]/40 font-bold text-[10px] tracking-wider uppercase transition-all"
              >
                ⚡ Apply 33RD Preset
              </button>
            )}
          </div>
        </div>

        {/* Checklist Content */}
        <div className="p-5 space-y-3.5 flex-1">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                item.completed
                  ? "border-[#1C5449]/70 bg-[#0E1F1D]/40 hover:bg-[#0E1F1D]/60"
                  : "border-[#1C202B] bg-[#0E0F14] hover:border-[#2D3344]"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleItem(item.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="accent-[#31E3AC] w-4 h-4 rounded cursor-pointer mt-0.5 flex-shrink-0"
                />

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#161922] text-[#FF7700] border border-[#222736]">
                        {item.milestone}
                      </span>
                      <h4
                        className={`text-xs font-bold ${
                          item.completed ? "text-[#F8FAFC]" : "text-[#D1D5DB]"
                        }`}
                      >
                        {item.title}
                      </h4>
                    </div>

                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                        item.completed
                          ? "bg-[#31E3AC]/15 text-[#31E3AC] border-[#31E3AC]/30"
                          : "bg-[#202430] text-[#717686] border-[#2A3040]"
                      }`}
                    >
                      {item.completed ? "VERIFIED" : "PENDING"}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#8E9AA8] leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#5A6278] pt-1">
                    <span>⚙</span>
                    <span className="truncate">{item.technicalRef}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Hard Proof Target Panel */}
          <div className="p-4 rounded-xl border border-[#FF3E00]/30 bg-[#0E0F14] space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#FF7700] font-bold text-[11px] uppercase tracking-wider">
                CANONICAL INCINERATOR PROOF
              </span>
              <span className="text-[9px] text-[#31E3AC] font-bold">100% LP BURN</span>
            </div>

            <div className="p-2.5 rounded bg-[#08090C] border border-[#1A1C25] text-[11px] text-[#D1D5DB] break-all select-all">
              {SOLANA_INCINERATOR_ADDRESS.toBase58()}
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <a
                href={SOLANA_INCINERATOR_SOLSCAN}
                target="_blank"
                rel="noreferrer"
                className="text-[#38BDF8] hover:underline flex items-center gap-1"
              >
                <span>View Incinerator on Solscan ↗</span>
              </a>
              <a
                href="https://33rdtreelabs.tech/tokenomics.html"
                target="_blank"
                rel="noreferrer"
                className="text-[#8E9AA8] hover:text-white hover:underline flex items-center gap-1"
              >
                <span>Tokenomics Spec ↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="sticky bottom-0 bg-[#0C0E14] border-t border-[#1C202B] p-4 flex items-center justify-between gap-3">
          <div className="text-[10px] font-mono text-[#717686]">
            Target: <span className="text-[#F8FAFC]">33,333,333 $33RD (Immutable Cap)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#14151C] hover:bg-[#1C1E28] border border-[#262A38] text-xs font-mono text-[#F8FAFC] transition-colors"
          >
            Close Runbook
          </button>
        </div>
      </div>
    </div>
  );
};
