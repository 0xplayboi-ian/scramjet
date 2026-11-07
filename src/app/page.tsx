"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { SavingsCalculator } from "../components/home/SavingsCalculator";
import { PerfProvider } from "../components/perf/PerfProvider";
import { SmoothScroll } from "../components/scroll/SmoothScroll";
import { HoverShear } from "../components/interactions/HoverShear";
import { InstrumentDial } from "../components/interactions/InstrumentDial";
import { MagneticIgnitionButton } from "../components/interactions/MagneticIgnitionButton";
import { SectionVeil } from "../components/interactions/SectionVeil";
import { HypersonicStream } from "../components/hypersonic/HypersonicStream";
import { MempoolInterceptRadar } from "../components/hypersonic/MempoolInterceptRadar";
import { AntiMevShield } from "../components/hypersonic/AntiMevShield";
import { WorkingGhostFunderVault } from "../components/hypersonic/WorkingGhostFunderVault";
import { FunctioningTerminalCli } from "../components/hypersonic/FunctioningTerminalCli";
import { ChapterCascadeRail } from "../components/hypersonic/ChapterCascadeRail";
import LazyStage from "../components/three/LazyStage";

// Dynamically import 3D Three.js scenes to guarantee zero SSR hydration mismatches
const IntakeScene = dynamic(() => import("../components/three/IntakeScene"), {
  ssr: false,
});
const RibbonScene = dynamic(() => import("../components/three/RibbonScene"), {
  ssr: false,
});
const ShockScene = dynamic(() => import("../components/three/ShockScene"), {
  ssr: false,
});

export default function HomePage() {
  const supportedLaunchpads = [
    { name: "Pump.fun", icon: "/icons/dex/pumpfun.webp", desc: "Bonding Curve" },
    { name: "Meteora DBC", icon: "/icons/dex/meteoradbc.webp", desc: "Dynamic DLMM" },
    { name: "Raydium LaunchLab", icon: "/icons/dex/raydium.webp", desc: "OpenBook v2" },
    { name: "Bags", icon: "/icons/dex/bags.webp", desc: "Creator Rewards" },
    { name: "LetsBonk", icon: "/icons/dex/bonkfun.webp", desc: "Bonk Liquidity" },
    { name: "StonkFun", icon: "/icons/dex/stonkfun.webp", desc: "Velocity Bonding" },
    { name: "Printr", icon: "/icons/dex/pumpfun.webp", desc: "Instant Rails" },
    { name: "Anoncoin", icon: "/icons/dex/anoncoin.webp", desc: "Privacy Mint" },
    { name: "Surge", icon: "/icons/dex/surge.webp", desc: "Multi-Route" },
    { name: "Stoxes", icon: "/icons/dex/pumpfun.webp", desc: "AMM Pool" },
    { name: "Lesgo", icon: "/icons/dex/pumpfun.webp", desc: "Fair Launch" },
    { name: "MemeFun", icon: "/icons/dex/bonkfun.webp", desc: "Ecosystem Pool" },
  ];

  return (
    <PerfProvider>
      <SmoothScroll />
      <HoverShear />
      <InstrumentDial />

      <div className="bg-[#07080B] text-[#F8FAFC] font-sans selection:bg-[#FF3E00]/30 selection:text-white min-h-screen relative overflow-x-hidden">
        {/* Subtle Ambient Background Flare */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] bg-gradient-to-b from-[#FF3E00]/8 via-[#FF7700]/3 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* ================= 1. HERO SECTION ================= */}
        <section className="pt-20 pb-12 px-4 sm:px-6 text-center max-w-6xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF3E00]/10 border border-[#FF3E00]/30 text-[#FF7700] text-xs font-mono font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(255,62,0,0.15)]">
            <span className="w-2 h-2 rounded-full bg-[#FF3E00] animate-pulse" />
            <span>SOLANA MAINNET BETA // 3.5% PROTOCOL FEE // MACH 3.5</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#F8FAFC] leading-[1.05]">
            Hypersonic Solana Launches. <br />
            <span className="bg-gradient-to-r from-[#FF3E00] via-[#FF7700] to-[#FFA040] bg-clip-text text-transparent">
              Zero $45k Retainers.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#8E9AA8] max-w-2xl mx-auto leading-relaxed">
            The first mathematically unclusterable Solana launchpad. <span className="text-[#31E3AC] font-semibold">3.5% platform fee</span> (30% less than Proxima), 
            <span className="text-[#FF7700] font-semibold"> 0.01 SOL sub-wallet micro-funding</span>, and cryptographic Merkle relay trees that bypass BubbleMaps detection 
            without paying off analytics firms.
          </p>

          {/* Key Flight Metrics Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-xs font-mono text-[#8E9AA8]">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0C0E14] border border-[#1C202B]">
              <span>Live on</span>
              <div className="flex items-center gap-1.5">
                <img src="/icons/chains/sol.webp" alt="Solana" className="w-4 h-4 object-contain" />
                <span className="text-[#31E3AC] font-bold">Solana</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0C0E14] border border-[#1C202B] text-[#F8FAFC]">
              <span className="text-[#636879]">Enclave:</span>
              <span className="font-bold text-[#38BDF8]">Turnkey</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0C0E14] border border-[#1C202B] text-[#31E3AC]">
              <span className="text-[#636879]">Platform Fee:</span>
              <span className="font-bold font-mono">3.5% (-30% vs Proxima)</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0C0E14] border border-[#1C202B] text-[#FF7700]">
              <span className="text-[#636879]">Min Sub-Wallet:</span>
              <span className="font-bold font-mono">0.01 SOL (10x lower)</span>
            </div>
          </div>

          {/* Action Ignition Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <MagneticIgnitionButton
              href="/launch"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#FF3E00] to-[#FF7700] text-black font-extrabold text-xs tracking-wider uppercase shadow-[0_0_25px_rgba(255,62,0,0.4)]"
            >
              Launch a Token Now &rarr;
            </MagneticIgnitionButton>
            <Link
              href="/workspace"
              className="h-[46px] px-8 rounded-xl bg-[#0E0F14] hover:bg-[#161720] border border-[#1C202B] hover:border-[#FF3E00]/50 text-[#F8FAFC] font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center"
            >
              Live Terminal HUD
            </Link>
          </div>

          {/* ================= PROPOSAL #02: MONUMENTAL 5X 3D GOD CANDLE HERO ================= */}
          <div className="pt-8 text-left">
            <div className="rounded-2xl border border-[#FF3E00]/40 bg-[#08090C] overflow-hidden shadow-[0_25px_70px_-15px_rgba(255,62,0,0.15)] relative">
              {/* Cockpit HUD Bar */}
              <div className="h-11 px-4 sm:px-6 border-b border-[#1C202B] bg-[#0C0E14] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FF3E00]/20 text-[#FF7700] text-[10px] font-bold">
                    PROPOSAL #02 &bull; MONUMENTAL 5X GOD CANDLE
                  </span>
                  <span className="text-[#F8FAFC] font-bold">$SCRAM</span>
                  <span className="text-[11px] text-[#717686] hidden sm:inline">Mach 3.5 &bull; Flat Laser Cap &bull; Supersonic Shockwave</span>
                </div>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="text-[#8E9AA8] hidden md:inline">BubbleMaps: <strong className="text-[#31E3AC]">0.0% Risk</strong></span>
                  <span className="text-[#8E9AA8]">Rent Reclaim: <strong className="text-[#31E3AC]">+0.00204 SOL</strong></span>
                  <span className="text-[#31E3AC] font-bold">● JITO BLOCK-0 ACTIVE</span>
                </div>
              </div>

              {/* 3D God Candle Canvas Stage */}
              <div className="h-[440px] sm:h-[480px] w-full relative bg-[#06080E]">
                <LazyStage fallbackSrc="/fallbacks/godcandle.svg">
                  <IntakeScene onReady={() => {}} />
                </LazyStage>
              </div>
            </div>
          </div>
        </section>

        {/* ================= PROPOSAL #04: HYPERSONIC TRANSACTION STREAM ================= */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
          <HypersonicStream />
        </section>

        <SectionVeil />

        {/* ================= PROPOSALS #25 & #26: CHAPTER RAIL & CASCADE CHAMBER ================= */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <ChapterCascadeRail />
        </section>

        <SectionVeil />

        {/* ================= PROPOSALS #07 & #08: MEMPOOL RADAR & ANTI-MEV DEFLECTOR ================= */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="text-center space-y-2 mb-6">
            <span className="px-3 py-1 rounded-full bg-[#FF3E00]/10 border border-[#FF3E00]/30 text-[#FF7700] text-xs font-mono font-bold tracking-wider uppercase">
              TACTICAL DEFENCE SUITE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
              360° Mempool Sonar &bull; Kinetic Anti-MEV Deflector
            </h2>
            <p className="text-xs sm:text-sm text-[#8E9AA8] max-w-2xl mx-auto">
              Real-time interception of toxic mempool order flow, sandwich attack deflections, and private validator tip auctions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MempoolInterceptRadar />
            <AntiMevShield />
          </div>
        </section>

        <SectionVeil />

        {/* ================= PROPOSAL #10: FUNCTIONING GHOST FUNDER VAULT ================= */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <WorkingGhostFunderVault />
        </section>

        <SectionVeil />

        {/* ================= PROPOSAL #23: FUNCTIONING HYPERSONIC CLI ================= */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="text-center space-y-2 mb-6">
            <span className="px-3 py-1 rounded-full bg-[#FF3E00]/10 border border-[#FF3E00]/30 text-[#FF7700] text-xs font-mono font-bold tracking-wider uppercase">
              COMMAND MATRIX &bull; PROPOSAL #23
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
              Hypersonic Launch CLI Terminal
            </h2>
            <p className="text-xs sm:text-sm text-[#8E9AA8] max-w-2xl mx-auto">
              Direct terminal access to telemetry, DEX protocols, BubbleMaps audit scans, stealth derivation, and Block-0 synthesis.
            </p>
          </div>

          <FunctioningTerminalCli />
        </section>

        <SectionVeil />

        {/* ================= PROPOSALS #27 & #28: MACH RIBBON & SHOCK FIELD ================= */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="rounded-2xl border border-[#FF3E00]/30 bg-[#08090C] p-6 lg:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1C202B] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-[#FF3E00]/15 text-[#FF7700] text-[10px] font-mono font-bold">
                    PROPOSALS #27 &bull; #28
                  </span>
                  <span className="text-xs font-mono text-[#8E9AA8]">WebGL Supersonic Aerodynamics</span>
                </div>
                <h3 className="text-xl font-bold text-[#F8FAFC]">
                  Mach Ribbon &bull; Supersonic Shock Vector Lattice
                </h3>
              </div>
              <div className="text-xs font-mono text-[#31E3AC]">
                Mach 3.5 Boundary Wake Active
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mach Ribbon */}
              <div className="h-[220px] rounded-xl overflow-hidden border border-[#1C202B] bg-[#050608] relative">
                <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded bg-[#08090C]/80 border border-[#1C202B] text-[10px] font-mono text-[#FF7700]">
                  PROPOSAL #27: MACH RIBBON (GLSL SHOCK)
                </div>
                <LazyStage fallbackSrc="/fallbacks/ribbon.svg">
                  <RibbonScene onReady={() => {}} />
                </LazyStage>
              </div>

              {/* Shock Field */}
              <div className="h-[220px] rounded-xl overflow-hidden border border-[#1C202B] bg-[#050608] relative">
                <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded bg-[#08090C]/80 border border-[#1C202B] text-[10px] font-mono text-[#38BDF8]">
                  PROPOSAL #28: SHOCK FIELD (VECTOR LATTICE)
                </div>
                <LazyStage fallbackSrc="/fallbacks/shock.svg">
                  <ShockScene onReady={() => {}} />
                </LazyStage>
              </div>
            </div>
          </div>
        </section>

        <SectionVeil />

        {/* ================= 2. THE RECEIPTS: $45K/MO PROXIMA BUBBLEMAPS DEAL ================= */}
        <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF2A55]/10 border border-[#FF2A55]/30 text-[#FF2A55] text-xs font-mono font-bold">
              <span>THE RECEIPTS // BUBBLEMAPS ENTERPRISE SOW</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F8FAFC]">
              Proxima Pays BubbleMaps $45,000 / Month. <br />
              <span className="text-[#8E9AA8]">We Built Real Cryptographic Independence.</span>
            </h2>
            <p className="text-sm text-[#8E9AA8] max-w-3xl leading-relaxed">
              Since April 2025, Proxima Tools has been on a recurring $45,000/month retainer with BubbleMaps SAS 
              for "automated clustering parameters" and "block-level bundle processing visibility" (Exhibit A Statement of Work). 
              When detection algorithms shift, their entire platform goes into emergency maintenance. 
              SCRAMJET doesn't pay off analytics firms—we engineer mathematically unclusterable Merkle relay trees.
            </p>
          </div>

          {/* 3 Evidence Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {/* Evidence 1: The Contract */}
            <div className="p-5 rounded-xl border border-[#22242F] bg-[#0E0F14] space-y-3">
              <div className="flex justify-between items-center text-[10px] text-[#717686]">
                <span>SIGNED: APRIL 11, 2025</span>
                <span className="text-[#FF2A55] font-bold">EXHIBIT A</span>
              </div>
              <div className="font-bold text-sm text-[#F8FAFC]">
                $45,000 / Month Retainer
              </div>
              <p className="text-[11px] text-[#8E9AA8] leading-relaxed">
                Section 3.1: Proxima pays BubbleMaps $45,000 USD monthly for 25 hours of advisory ($1,800/hr excess) 
                covering bi-weekly audits of "automated clustering parameters" and liquidity distribution telemetry.
              </p>
              <div className="text-[10px] text-[#565B6D] pt-2 border-t border-[#1C202B]">
                Signers: Théo Martin (Proxima CEO) &amp; Nicolas Vaiman (Bubblemaps CEO)
              </div>
            </div>

            {/* Evidence 2: The Telegram Leak */}
            <div className="p-5 rounded-xl border border-[#22242F] bg-[#0E0F14] space-y-3">
              <div className="flex justify-between items-center text-[10px] text-[#717686]">
                <span>TELEGRAM: MAY 19, 2025</span>
                <span className="text-[#FF7700] font-bold">THE LEAK</span>
              </div>
              <div className="font-bold text-sm text-[#F8FAFC]">
                "InsightX Patched Us"
              </div>
              <blockquote className="text-[11px] text-[#8E9AA8] leading-relaxed italic border-l-2 border-[#FF7700] pl-2.5">
                "InsightX (Bubblemaps) has fixed the technique that most bundlers were using to stay undetected. 
                We've put Proxima into maintenance while we find a new solution..."
              </blockquote>
              <div className="text-[10px] text-[#565B6D] pt-2 border-t border-[#1C202B]">
                Public announcement from !Theo to Proxima users
              </div>
            </div>

            {/* Evidence 3: The SCRAMJET Solution */}
            <div className="p-5 rounded-xl border border-[#FF3E00]/40 bg-[#0E0F14] space-y-3 shadow-[0_0_20px_rgba(255,62,0,0.1)]">
              <div className="flex justify-between items-center text-[10px] text-[#FF3E00]">
                <span>SCRAMJET ENGINE</span>
                <span className="font-bold">ZERO BRIBES</span>
              </div>
              <div className="font-bold text-sm text-[#F8FAFC]">
                Cryptographic Relay Trees
              </div>
              <p className="text-[11px] text-[#8E9AA8] leading-relaxed">
                We don't rely on backroom whitelists. Our Ghost Funder breaks wallet graphs via multi-hop Merkle relays, 
                randomized timestamp spacing (30m–12h), and 0.01 SOL micro-funding that leaves zero single-parent links.
              </p>
              <div className="text-[10px] text-[#31E3AC] pt-2 border-t border-[#1C202B] font-bold">
                100% On-Chain Mathematical Independence
              </div>
            </div>
          </div>
        </section>

        {/* ================= 3. SAVINGS CALCULATOR ================= */}
        <section className="py-12 px-4 sm:px-6 max-w-6xl mx-auto border-t border-[#14161F]">
          <SavingsCalculator />
        </section>

        {/* ================= 4. LAUNCH ACROSS 12 PROTOCOLS ================= */}
        <section className="py-16 border-t border-[#14161F] bg-[#0A0B0E] text-center space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] tracking-tight uppercase">
              Deploy Across 12 Solana Protocols
            </h3>
            <p className="text-xs text-[#8E9AA8]">
              Full native instruction builders for bonding curves, dynamic fee tiers, and AMMs.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 px-4 sm:px-6 max-w-6xl mx-auto">
            {supportedLaunchpads.map((lp, idx) => (
              <Link
                key={idx}
                href="/launch"
                className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-[#1A1C25] bg-[#0E0F14] hover:border-[#FF3E00]/50 hover:bg-[#141720] transition-all group"
              >
                <img src={lp.icon} alt={lp.name} className="w-7 h-7 object-contain rounded mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-[#F8FAFC]">{lp.name}</span>
                <span className="text-[10px] text-[#717686] font-mono mt-0.5">{lp.desc}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ================= 5. FINAL IGNITION CALL TO ACTION ================= */}
        <section className="py-24 px-4 sm:px-6 max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight uppercase">
            Ready to Outrun the Cartel?
          </h2>
          <p className="text-sm text-[#8E9AA8] max-w-xl mx-auto leading-relaxed">
            Launch with Jito Block-0 atomic guarantee, 0.01 SOL micro-subwallets, and zero backroom analytics deals.
          </p>
          <div className="pt-2 flex justify-center">
            <MagneticIgnitionButton
              href="/launch"
              className="px-10 py-4 rounded-xl bg-gradient-to-r from-[#FF3E00] to-[#FF7700] text-black font-extrabold text-sm tracking-wider uppercase shadow-[0_0_35px_rgba(255,62,0,0.5)]"
            >
              Launch on Solana Now &rarr;
            </MagneticIgnitionButton>
          </div>
        </section>
      </div>
    </PerfProvider>
  );
}
