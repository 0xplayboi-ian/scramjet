"use client";

import React from "react";

export const ArchitectureBento: React.FC = () => {
  return (
    <div className="relative rounded-2xl border border-[#FF3E00]/30 bg-gradient-to-b from-[#0D0F14] via-[#090A0E] to-[#050608] p-5 sm:p-6 lg:p-7 overflow-hidden shadow-[0_0_35px_rgba(255,62,0,0.08)]">
      {/* Background Grid & Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#FF3E0006_1px,transparent_1px),linear-gradient(to_bottom,#FF3E0006_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#FF7700]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1C202B] pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FF3E00]/15 text-[#FF7700] border border-[#FF3E00]/30 text-[10px] font-mono font-bold tracking-wider uppercase">
              SYSTEM ARCHITECTURE
            </span>
            <span className="text-[10px] font-mono text-[#31E3AC] font-semibold">
              SCRAMJET VS PROXIMA BENCHMARK
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#F8FAFC]">
            Hypersonic Architecture &bull; Competitive Edge
          </h3>
          <p className="text-xs text-[#8E9AA8]">
            Why elite token creators launch on Scramjet instead of legacy platforms like Proxima.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-[#31E3AC]/10 border border-[#31E3AC]/30 text-right">
            <div className="text-[9px] font-mono text-[#717686] uppercase">Launch Fee Delta</div>
            <div className="text-xs font-mono font-bold text-[#31E3AC]">30% LESS COST</div>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-3.5">
        {/* Card 1: Merkle Relay Trees vs $45k BubbleMaps Retainer (Col 7) */}
        <div className="md:col-span-7 p-4 sm:p-5 rounded-xl bg-[#08090C] border border-[#1C202B] hover:border-[#FF3E00]/50 transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-[#FF7700] font-bold uppercase tracking-wider text-[10px]">
                ANTI-CLUSTERING CRYPTOGRAPHY
              </span>
              <span className="px-2 py-0.5 rounded bg-[#31E3AC]/10 text-[#31E3AC] text-[10px] font-bold">
                BUBBLEMAPS: 0% CORRELATION
              </span>
            </div>
            <h4 className="text-base font-bold text-[#F8FAFC]">
              Merkle Relay Trees vs $45,000/mo BubbleMaps Retainer
            </h4>
            <p className="text-xs text-[#8E9AA8] mt-1.5 leading-relaxed">
              Proxima launches fund all sub-wallets from a single parent account, forcing creators into costly compliance retainers or getting publicly flagged. Scramjet executes dynamic intermediate relay trees with non-round randomized jitter lamports, completely severing funding lineage on-chain.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#141720] text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-[#0F1117] border border-[#1C202B]">
              <div className="text-[9px] text-[#FF2A55] uppercase font-bold">PROXIMA BOTTLENECK</div>
              <div className="text-[#F8FAFC] font-semibold text-[11px] mt-0.5">Single-Parent Funding</div>
              <div className="text-[10px] text-[#717686] mt-0.5">96% cluster detection risk</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0F1117] border border-[#31E3AC]/30">
              <div className="text-[9px] text-[#31E3AC] uppercase font-bold">SCRAMJET ADVANTAGE</div>
              <div className="text-[#F8FAFC] font-semibold text-[11px] mt-0.5">Ghost Funder Relay Trees</div>
              <div className="text-[10px] text-[#31E3AC] mt-0.5">0.0% cluster correlation</div>
            </div>
          </div>
        </div>

        {/* Card 2: 3.5% Fee vs 5.0% Proxima (Col 5) */}
        <div className="md:col-span-5 p-4 sm:p-5 rounded-xl bg-[#08090C] border border-[#1C202B] hover:border-[#FF3E00]/50 transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-[#FF7700] font-bold uppercase tracking-wider text-[10px]">
                FEE EFFICIENCY
              </span>
              <span className="px-2 py-0.5 rounded bg-[#31E3AC]/10 text-[#31E3AC] text-[10px] font-bold">
                -30% LOWER FEES
              </span>
            </div>
            <h4 className="text-base font-bold text-[#F8FAFC]">
              3.5% Platform Fee vs Proxima 5.0%
            </h4>
            <p className="text-xs text-[#8E9AA8] mt-1.5 leading-relaxed">
              Keep more profits on every block. While Proxima extracts 5.0% flat fees with zero rebate tiers, Scramjet caps platform fee at 3.5%, saving up to 15 SOL per 1,000 SOL volume.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#0F1117] border border-[#1C202B] font-mono text-xs space-y-1">
            <div className="flex justify-between text-[#8E9AA8] text-[11px]">
              <span>Proxima Take Rate:</span>
              <span className="text-[#FF2A55] font-bold">5.0% (No Rebate)</span>
            </div>
            <div className="flex justify-between text-[#8E9AA8] text-[11px]">
              <span>Scramjet Take Rate:</span>
              <span className="text-[#31E3AC] font-bold">3.5% (VIP Tier: 0.0%)</span>
            </div>
          </div>
        </div>

        {/* Card 3: 0.01 SOL Micro Sub-Wallets (Col 4) */}
        <div className="md:col-span-4 p-4 rounded-xl bg-[#08090C] border border-[#1C202B] hover:border-[#FF3E00]/50 transition-all flex flex-col justify-between space-y-3">
          <div>
            <div className="text-[10px] font-mono text-[#FF7700] uppercase font-bold mb-1">
              CAPITAL VELOCITY
            </div>
            <h4 className="text-sm font-bold text-[#F8FAFC]">
              0.01 SOL Sub-Wallets
            </h4>
            <p className="text-xs text-[#8E9AA8] mt-1 leading-relaxed">
              Proxima demands 0.10 SOL lockup per sub-wallet. Scramjet micro-funding requires only 0.01 SOL, unlocking 10x greater wallet granularity without tying up capital.
            </p>
          </div>
          <div className="text-[10px] font-mono text-[#31E3AC] pt-2 border-t border-[#141720]">
            10x Lower Minimum Capital Lockup
          </div>
        </div>

        {/* Card 4: Automated ATA Rent Recovery (Col 4) */}
        <div className="md:col-span-4 p-4 rounded-xl bg-[#08090C] border border-[#1C202B] hover:border-[#FF3E00]/50 transition-all flex flex-col justify-between space-y-3">
          <div>
            <div className="text-[10px] font-mono text-[#31E3AC] uppercase font-bold mb-1">
              RENT RECLAIM SWEEP
            </div>
            <h4 className="text-sm font-bold text-[#F8FAFC]">
              Auto ATA Rent Recovery
            </h4>
            <p className="text-xs text-[#8E9AA8] mt-1 leading-relaxed">
              Every Solana SPL token account reserves ~0.00204 SOL in rent. Scramjet automatically closes zero-balance accounts and sweeps 100% of rent lamports back to your master payer.
            </p>
          </div>
          <div className="text-[10px] font-mono text-[#31E3AC] pt-2 border-t border-[#141720]">
            +0.0489 SOL Reclaimed / 24 Wallets
          </div>
        </div>

        {/* Card 5: Atomic Jito Multi-Engine (Col 4) */}
        <div className="md:col-span-4 p-4 rounded-xl bg-[#08090C] border border-[#1C202B] hover:border-[#FF3E00]/50 transition-all flex flex-col justify-between space-y-3">
          <div>
            <div className="text-[10px] font-mono text-[#FF7700] uppercase font-bold mb-1">
              MEV PRIVACY
            </div>
            <h4 className="text-sm font-bold text-[#F8FAFC]">
              Atomic Jito Block-0 Relay
            </h4>
            <p className="text-xs text-[#8E9AA8] mt-1 leading-relaxed">
              Direct private validator leader bundles. Token deploy and initial sub-wallet purchases land in the very first slot with zero public mempool exposure or frontrun risk.
            </p>
          </div>
          <div className="text-[10px] font-mono text-[#31E3AC] pt-2 border-t border-[#141720]">
            Zero Sandwich Leakage Guaranteed
          </div>
        </div>
      </div>
    </div>
  );
};
