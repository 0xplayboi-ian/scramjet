"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import LazyStage from "../three/LazyStage";
import CascadeScene from "../three/CascadeScene";

interface ChapterPhase {
  id: number;
  label: string;
  title: string;
  description: string;
  specs: { label: string; value: string }[];
}

const PHASES: ChapterPhase[] = [
  {
    id: 1,
    label: "PHASE 01",
    title: "Name It & Configure Curve",
    description: "Define ticker, token supply, metadata, and bonding curve configuration. Dynamic DLMM fee curve or classic pump mechanics.",
    specs: [
      { label: "Token Standard", value: "SPL Token-2022 / Classic" },
      { label: "Total Supply", value: "1,000,000,000" },
      { label: "Curve Liquidity", value: "Dynamic DLMM / Bonding" },
    ],
  },
  {
    id: 2,
    label: "PHASE 02",
    title: "Select Protocol Venue",
    description: "Deploy across 12 supported launchpads including Pump.fun, Meteora DBC, Raydium LaunchLab, Bags.fm, and LetsBonk with automated fee optimization.",
    specs: [
      { label: "Supported DEXes", value: "12 Solana Protocols" },
      { label: "Routing Latency", value: "< 5ms (Jito Engine)" },
      { label: "Auto LP Lock", value: "Permanent Burn / Escrow" },
    ],
  },
  {
    id: 3,
    label: "PHASE 03",
    title: "Fund Sub-Wallets (Ghost Vault)",
    description: "Generate up to 24 ephemeral sub-wallets via Turnkey enclave. Distribute funds via Merkle relay trees with randomized jitter to break BubbleMaps clustering.",
    specs: [
      { label: "Sub-Wallets", value: "Up to 24 Wallets" },
      { label: "BubbleMaps Score", value: "0% Single-Parent Risk" },
      { label: "ATA Rent Recovery", value: "+0.00204 SOL / Wallet" },
    ],
  },
  {
    id: 4,
    label: "PHASE 04",
    title: "Atomic Block-0 Execution",
    description: "Deploy mint transaction and simultaneous sub-wallet swaps inside a single atomic Jito Block-0 bundle with kinetic MEV sandwich protection.",
    specs: [
      { label: "Execution Mode", value: "Single-Slot Atomic Jito" },
      { label: "Slippage Protection", value: "Kinetic MEV Deflector" },
      { label: "Platform Fee", value: "3.5% (Scramjet Advantage)" },
    ],
  },
];

export const ChapterCascadeRail: React.FC = () => {
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
  const progressRef = useRef<number>(0);

  useEffect(() => {
    progressRef.current = activePhaseIndex / (PHASES.length - 1);
  }, [activePhaseIndex]);

  const currentPhase = PHASES[activePhaseIndex];

  return (
    <div className="relative rounded-2xl border border-[#FF3E00]/30 bg-gradient-to-b from-[#0B0D12] via-[#08090C] to-[#040507] p-6 lg:p-8 overflow-hidden shadow-[0_0_40px_rgba(255,62,0,0.06)]">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#FF3E0006_1px,transparent_1px),linear-gradient(to_bottom,#FF3E0006_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1C202B] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF3E00]/15 text-[#FF7700] border border-[#FF3E00]/30 text-[10px] font-mono font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF3E00] animate-pulse" />
              PROPOSAL #25 &amp; #26
            </span>
            <span className="text-[11px] font-mono text-[#8E9AA8]">
              Chapter Rail &bull; 3D Cascade Chamber
            </span>
          </div>
          <h3 className="text-xl lg:text-2xl font-bold tracking-tight text-[#F8FAFC]">
            Hypersonic Launch Stages &amp; Cascade Chamber
          </h3>
          <p className="text-xs text-[#8E9AA8] mt-1 max-w-2xl">
            Sticky flight rail tracking the four stages of a supersonic token launch. As you transition through
            phases, the 3D Cascade Chamber accelerates through supersonic tunnel rings.
          </p>
        </div>

        {/* Phase Indicator */}
        <div className="flex items-center gap-2">
          {PHASES.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setActivePhaseIndex(idx)}
              className={`w-9 h-9 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center border ${
                activePhaseIndex === idx
                  ? "bg-[#FF3E00] text-black border-[#FF3E00] shadow-[0_0_15px_rgba(255,62,0,0.4)] scale-105"
                  : "bg-[#0E1117] text-[#8E9AA8] border-[#1C202B] hover:border-[#2D3344]"
              }`}
            >
              0{p.id}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Stage Details, Right 3D Cascade Chamber */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
        {/* Left Column: Stage Information */}
        <div className="lg:col-span-6 space-y-4">
          {/* Phase Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-mono text-[#FF7700]">
            <span>{currentPhase.label}</span>
            <span>&bull;</span>
            <span className="text-[#31E3AC]">STAGE {activePhaseIndex + 1} OF 4</span>
          </div>

          <h4 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">
            {currentPhase.title}
          </h4>

          <p className="text-sm text-[#8E9AA8] leading-relaxed">
            {currentPhase.description}
          </p>

          {/* Specs List */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {currentPhase.specs.map((spec, sIdx) => (
              <div
                key={sIdx}
                className="p-3 rounded-xl bg-[#08090C] border border-[#1C202B] space-y-1"
              >
                <div className="text-[10px] font-mono uppercase text-[#717686]">
                  {spec.label}
                </div>
                <div className="text-xs font-mono font-bold text-[#F8FAFC]">
                  {spec.value}
                </div>
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="pt-4 flex items-center gap-3">
            <Link
              href="/launch"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF3E00] to-[#FF7700] text-black font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-[0_0_20px_rgba(255,62,0,0.3)] inline-flex items-center gap-2"
            >
              Open Launch HUD &rarr;
            </Link>

            <button
              onClick={() => setActivePhaseIndex((prev) => (prev + 1) % PHASES.length)}
              className="px-4 py-2.5 rounded-xl bg-[#141720] hover:bg-[#1F2433] text-xs font-mono text-[#F8FAFC] border border-[#1C202B] transition-colors"
            >
              Next Phase &rarr;
            </button>
          </div>
        </div>

        {/* Right Column: 3D Cascade Tunnel Scene */}
        <div className="lg:col-span-6 h-[340px] rounded-xl overflow-hidden border border-[#1C202B] bg-[#050608] relative">
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-2.5 py-1 rounded bg-[#08090C]/80 border border-[#1C202B] backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#FF7700] animate-ping" />
            <span className="text-[10px] font-mono text-[#8E9AA8]">
              WIND TUNNEL CAM: Z-PROGRESS {(progressRef.current * 100).toFixed(0)}%
            </span>
          </div>

          <LazyStage fallbackSrc="/fallbacks/cascade.svg">
            <CascadeScene onReady={() => {}} progressRef={progressRef} />
          </LazyStage>
        </div>
      </div>
    </div>
  );
};
