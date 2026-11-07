"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
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
import { ChapterRail, CascadeChamberSection } from "../components/hypersonic/ChapterCascadeRail";
import LazyStage from "../components/three/LazyStage";
import { ScrollProgressBar, Chapter, DeepDiveTriad, Reveal } from "../components/story/Story";

const IntakeScene = dynamic(() => import("../components/three/IntakeScene"), { ssr: false });
const RibbonScene = dynamic(() => import("../components/three/RibbonScene"), { ssr: false });
const ShockScene = dynamic(() => import("../components/three/ShockScene"), { ssr: false });

/** Full-bleed plasma wake section divider (#27 Mach Ribbon) */
function MachRibbonDivider() {
  return (
    <div className="relative w-full h-36 sm:h-48 overflow-hidden my-8" aria-hidden="true">
      <LazyStage fallbackSrc="/fallbacks/ribbon.svg">
        <RibbonScene onReady={() => {}} />
      </LazyStage>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#07080B] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#07080B] to-transparent" />
    </div>
  );
}

export default function HomePage() {
  return (
    <PerfProvider>
      <SmoothScroll />
      <ScrollProgressBar />
      <HoverShear />
      <InstrumentDial />

      <div className="bg-[#07080B] text-[#F8FAFC] font-sans selection:bg-[#FF3E00]/30 selection:text-white min-h-screen relative overflow-x-hidden">
        {/* Ambient Top Glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] bg-gradient-to-b from-[#FF3E00]/8 via-[#FF7700]/3 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* ================= HERO + 5X 3D GOD CANDLE (#02) ================= */}
        <section className="pt-20 pb-16 px-4 sm:px-6 text-center max-w-6xl mx-auto space-y-6">
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
            The first mathematically unclusterable Solana launchpad.{" "}
            <span className="text-[#31E3AC] font-semibold">3.5% platform fee</span> (30% less than Proxima),{" "}
            <span className="text-[#FF7700] font-semibold">0.01 SOL sub-wallet micro-funding</span>, and cryptographic
            Merkle relay trees that bypass BubbleMaps detection without paying off analytics firms.
          </p>

          {/* Key Flight Metrics Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 pt-2 text-xs font-mono text-[#8E9AA8]">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0C0E14] border border-[#1C202B]">
              <span>Live on</span>
              <div className="flex items-center gap-1.5">
                <img src="/icons/chains/sol.webp" alt="Solana" className="w-4 h-4 object-contain" />
                <span className="text-[#31E3AC] font-bold">Solana</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0C0E14] border border-[#1C202B] text-[#F8FAFC]">
              <span className="text-[#636879]">Enclave:</span>
              <span className="font-bold text-[#38BDF8]">Turnkey HSM</span>
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

          {/* Action Ignition Buttons (#30) */}
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

          {/* 3D God Candle Stage (#02) */}
          <div className="pt-10 text-left">
            <div className="rounded-2xl border border-[#FF3E00]/40 bg-[#08090C] overflow-hidden shadow-[0_25px_70px_-15px_rgba(255,62,0,0.15)] relative">
              <div className="h-11 px-4 sm:px-6 border-b border-[#1C202B] bg-[#0C0E14] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FF3E00]/20 text-[#FF7700] text-[10px] font-bold">
                    LIVE BREAKOUT TELEMETRY
                  </span>
                  <span className="text-[#F8FAFC] font-bold">$SCRAM</span>
                  <span className="text-[11px] text-[#717686] hidden sm:inline">
                    Mach 3.5 &bull; Block-0 Execution Engine
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="text-[#8E9AA8] hidden md:inline">
                    BubbleMaps: <strong className="text-[#31E3AC]">0.0% Risk</strong>
                  </span>
                  <span className="text-[#8E9AA8]">
                    Rent Reclaim: <strong className="text-[#31E3AC]">+0.00204 SOL</strong>
                  </span>
                  <span className="text-[#31E3AC] font-bold">● JITO BLOCK-0 ACTIVE</span>
                </div>
              </div>

              <div className="h-[440px] sm:h-[500px] w-full relative bg-[#06080E]">
                <LazyStage fallbackSrc="/fallbacks/godcandle.svg">
                  <IntakeScene onReady={() => {}} />
                </LazyStage>
              </div>
            </div>
          </div>
        </section>

        {/* Full-bleed Mach Ribbon Plasma Wake (#27) */}
        <MachRibbonDivider />

        {/* ================= CHAPTER 01 + HYPERSONIC STREAM (#04) ================= */}
        <Chapter
          number="01"
          kicker="THE VELOCITY BOTTLENECK"
          badge="400MS SLOT EXECUTION"
          title="Launching on Solana is a race you usually"
          accent="lose before Block-0."
          body="Public RPCs broadcast your token deploy to predatory MEV searchers milliseconds before your own buy orders land. Scramjet bypasses public gossip entirely—routing your creation and up to 24 sub-wallet buys through direct fiber Jito block engines."
          points={[
            {
              label: "Zero Mempool Exposure",
              text: "Your deploy and initial buys execute atomically inside the same block—snipers cannot wedge between them.",
            },
            {
              label: "5x Multi-Region Jito Relays",
              text: "Simultaneous dispatch to Frankfurt, Amsterdam, NY, Tokyo, and SLC block engines for 99.98% inclusion.",
            },
            {
              label: "Sub-5ms Instruction Packing",
              text: "Custom Lookup Tables (ALTs) compress 24 wallet buys into a single atomic Jito bundle.",
            },
          ]}
        />

        <Reveal className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
          <HypersonicStream />
        </Reveal>

        <DeepDiveTriad
          items={[
            {
              tag: "ENGINE 01 // ALT COMPRESSION",
              title: "Address Lookup Table Packing",
              body: "Standard Solana transactions hit the 1232-byte limit after 3 swaps. Scramjet pre-compiles custom ALTs on-the-fly so 24 distinct sub-wallets execute in one atomic Block-0 bundle.",
              metric: "24 Wallets / 1 Slot",
            },
            {
              tag: "ENGINE 02 // TURNKEY HSM",
              title: "Hardware Enclave Key Isolation",
              body: "Sub-wallet private keys are generated inside Turnkey secure hardware enclaves. Signatures happen in-enclave in under 8ms with zero browser local-storage leakage.",
              metric: "< 8ms Enclave Sign",
            },
            {
              tag: "ENGINE 03 // RENT SWEEP",
              title: "Automated ATA Rent Recovery",
              body: "Every SPL token account locks 0.00204 SOL in rent. When sub-wallets exit positions, Scramjet batch-closes empty ATAs and sweeps 100% of rent lamports back to your master vault.",
              metric: "+0.0489 SOL / 24w",
            },
          ]}
        />

        <SectionVeil />

        {/* ================= STICKY CHAPTER RAIL (#25) & 3D CASCADE CHAMBER (#26) ================= */}
        <ChapterRail />
        <CascadeChamberSection />

        {/* Full-bleed Mach Ribbon Plasma Wake (#27) */}
        <MachRibbonDivider />

        {/* ================= CHAPTER 02 + MEMPOOL RADAR (#07) & ANTI-MEV SHIELD (#08) ================= */}
        <Chapter
          number="02"
          kicker="TACTICAL COUNTERMEASURES"
          badge="ACTIVE MEV DEFENCE"
          title="Hostile order flow is detected and"
          accent="deflected in real time."
          body="Legacy bundlers fire blind and hope snipers miss. Scramjet continuously scans unconfirmed leader queues for predatory sandwich bots and wraps your launch in a kinetic slippage corridor with automated Sniper Guard triggers."
          points={[
            {
              label: "360° Mempool Sonar",
              text: "Real-time classification of incoming priority tips, front-run bots, and shielded Jito bundles.",
            },
            {
              label: "Kinetic Anti-MEV Deflector",
              text: "Clamps slippage corridors to 0.00% leakage and triggers instant auto-nuke if external buys breach your threshold.",
            },
          ]}
        />

        <Reveal className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          <MempoolInterceptRadar />
        </Reveal>

        <SectionVeil />

        <Chapter
          number="03"
          kicker="KINETIC SLIPPAGE ARMOR"
          badge="ZERO SANDWICH LEAKAGE"
          title="Predatory bots bounce off an atomic"
          accent="deflector shield."
          body="When external snipers attempt to sandwich your initial liquidity pool, Scramjet's kinetic deflector isolates your mint and holder buys inside a locked slippage corridor—Compare vulnerable Public RPC routing against Scramjet Block-0 Armor below."
          points={[
            {
              label: "100% Locked Slippage Corridor",
              text: "Zero price-impact leakage between token creation and your cohort buys.",
            },
            {
              label: "Automated Sniper Guard",
              text: "Configure an external SOL threshold to automatically hold, TWAP-sell, or nuke if unwanted bots enter.",
            },
          ]}
        />

        <Reveal className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          <AntiMevShield />
        </Reveal>

        <SectionVeil />

        {/* ================= CHAPTER 03 + WORKING GHOST FUNDER VAULT (#10) ================= */}
        <Chapter
          number="04"
          kicker="CRYPTOGRAPHIC UNCLUSTERABILITY"
          badge="LIVE KEYPAIR DERIVATION"
          title="Sever the funding lineage before anyone can"
          accent="map your wallets."
          body="When you fund 20 holder wallets from one deployer address, BubbleMaps and InsightX immediately draw a giant red cluster over your token. Our Ghost Funder routes SOL through multi-hop Merkle relay trees with randomized lamport jitter—test it live below with real @solana/web3.js keypairs."
          points={[
            {
              label: "Ephemeral Relay Nodes",
              text: "Master funds split across intermediate relay keypairs that never touch the token contract.",
            },
            {
              label: "Non-Round Lamport Jitter",
              text: "Applies ±7.5% randomized deviation (e.g. 0.2384 SOL vs 0.2500 SOL) to defeat amount-matching heuristics.",
            },
            {
              label: "0.01 SOL Micro-Subwallets",
              text: "10x lower minimum balance than Proxima's 0.10 SOL lockup requirement.",
            },
          ]}
        />

        <Reveal className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <WorkingGhostFunderVault />
        </Reveal>

        <SectionVeil />

        {/* ================= CHAPTER 04 + FUNCTIONING TERMINAL CLI (#23) ================= */}
        <Chapter
          number="05"
          kicker="DIRECT COMMAND MATRIX"
          badge="INTERACTIVE SHELL"
          title="Prefer the keyboard? Drive the entire engine from the"
          accent="Hypersonic CLI."
          body="Run live network telemetry, inspect all 12 supported Solana DEX venues, run a BubbleMaps cluster audit on any mint, or synthesize a Block-0 launch bundle directly from the terminal below."
          points={[
            {
              label: "Instant Quick-Actions",
              text: "Click any command pill ([telemetry], [venues], [audit], [ghost-vault], [launch JET]) or type help.",
            },
            {
              label: "Full Command History",
              text: "Use Up/Down arrow keys to cycle previous commands just like a native UNIX shell.",
            },
          ]}
        />

        <Reveal className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <FunctioningTerminalCli />
        </Reveal>

        <SectionVeil />

        {/* ================= CHAPTER 05: THE RECEIPTS ================= */}
        <Chapter
          number="06"
          kicker="THE RECEIPTS // VERIFIED EVIDENCE"
          badge="ZERO EXTORTION FEES"
          title="Proxima pays BubbleMaps $45,000/month."
          accent="We built real cryptography."
          body="Since April 2025, Proxima Tools has been on a recurring $45,000/month retainer with BubbleMaps SAS for 'automated clustering parameters' (Exhibit A Statement of Work). When detection algorithms shift, their platform goes into emergency maintenance. Scramjet doesn't pay off analytics firms—we engineer mathematically unclusterable Merkle relay trees."
          points={[
            {
              label: "3.5% vs 5.0% Fee",
              text: "Keep 30% more of your creator harvest on every single launch.",
            },
            {
              label: "100% On-Chain Independence",
              text: "No backroom whitelists that can be revoked or patched overnight.",
            },
          ]}
        />

        <section className="pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-xs">
            <Reveal delay={0}>
              <div className="p-6 rounded-2xl border border-[#22242F] bg-[#0E0F14] space-y-3 h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] text-[#717686]">
                    <span>SIGNED: APRIL 11, 2025</span>
                    <span className="text-[#FF2A55] font-bold">EXHIBIT A</span>
                  </div>
                  <div className="font-bold text-base text-[#F8FAFC]">$45,000 / Month Retainer</div>
                  <p className="text-xs text-[#8E9AA8] leading-relaxed font-sans">
                    Section 3.1: Proxima pays BubbleMaps $45,000 USD monthly for 25 hours of advisory ($1,800/hr excess)
                    covering bi-weekly audits of &ldquo;automated clustering parameters&rdquo; and liquidity distribution telemetry.
                  </p>
                </div>
                <div className="text-[10px] text-[#565B6D] pt-3 border-t border-[#1C202B]">
                  Signers: Théo Martin (Proxima CEO) &amp; Nicolas Vaiman (Bubblemaps CEO)
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="p-6 rounded-2xl border border-[#22242F] bg-[#0E0F14] space-y-3 h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] text-[#717686]">
                    <span>TELEGRAM: MAY 19, 2025</span>
                    <span className="text-[#FF7700] font-bold">THE LEAK</span>
                  </div>
                  <div className="font-bold text-base text-[#F8FAFC]">&ldquo;InsightX Patched Us&rdquo;</div>
                  <blockquote className="text-xs text-[#8E9AA8] leading-relaxed italic border-l-2 border-[#FF7700] pl-3 font-sans">
                    &ldquo;InsightX (Bubblemaps) has fixed the technique that most bundlers were using to stay undetected.
                    We&apos;ve put Proxima into maintenance while we find a new solution...&rdquo;
                  </blockquote>
                </div>
                <div className="text-[10px] text-[#565B6D] pt-3 border-t border-[#1C202B]">
                  Public announcement from !Theo to Proxima users
                </div>
              </div>
            </Reveal>

            <Reveal delay={240}>
              <div className="p-6 rounded-2xl border border-[#FF3E00]/40 bg-[#0E0F14] space-y-3 shadow-[0_0_25px_rgba(255,62,0,0.12)] h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] text-[#FF7700]">
                    <span>SCRAMJET ENGINE</span>
                    <span className="font-bold">ZERO BRIBES</span>
                  </div>
                  <div className="font-bold text-base text-[#F8FAFC]">Cryptographic Relay Trees</div>
                  <p className="text-xs text-[#8E9AA8] leading-relaxed font-sans">
                    We don&apos;t rely on backroom whitelists. Our Ghost Funder breaks wallet graphs via multi-hop Merkle relays,
                    randomized timestamp spacing (30m–12h), and 0.01 SOL micro-funding that leaves zero single-parent links.
                  </p>
                </div>
                <div className="text-[10px] text-[#31E3AC] pt-3 border-t border-[#1C202B] font-bold">
                  100% On-Chain Mathematical Independence
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================= FULL-BLEED SHOCK FIELD (#28) + FINAL IGNITION CTA (#30) ================= */}
        <section className="relative w-full min-h-[520px] flex items-center justify-center overflow-hidden border-t border-[#14161F]">
          {/* Section-scale pointer-reactive Shock Field backdrop (#28) */}
          <div className="absolute inset-0">
            <LazyStage fallbackSrc="/fallbacks/shock.svg">
              <ShockScene onReady={() => {}} />
            </LazyStage>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#07080B] via-transparent to-[#07080B]" />

          <div className="relative z-10 py-28 px-4 sm:px-6 max-w-4xl mx-auto text-center space-y-6">
            <Reveal>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF3E00]/15 border border-[#FF3E00]/40 text-[#FF7700] text-[10px] font-mono font-bold uppercase tracking-widest mb-2 backdrop-blur-sm">
                MACH 3.5 SHOCK FIELD // READY FOR IGNITION
              </span>
              <h2 className="text-4xl sm:text-6xl font-black text-[#F8FAFC] tracking-tight uppercase drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
                Ready to Outrun the Cartel?
              </h2>
              <p className="text-sm sm:text-base text-[#C5CCD6] max-w-xl mx-auto leading-relaxed mt-3 drop-shadow">
                Launch with Jito Block-0 atomic guarantee, 0.01 SOL micro-subwallets, and zero backroom analytics retainers.
              </p>
              <div className="pt-6 flex flex-wrap justify-center gap-4">
                <MagneticIgnitionButton
                  href="/launch"
                  className="px-10 py-4 rounded-xl bg-gradient-to-r from-[#FF3E00] to-[#FF7700] text-black font-extrabold text-sm tracking-wider uppercase shadow-[0_0_35px_rgba(255,62,0,0.5)]"
                >
                  Launch on Solana Now &rarr;
                </MagneticIgnitionButton>
                <Link
                  href="/funder"
                  className="px-8 py-4 rounded-xl border border-[#1C202B] bg-[#0C0E14]/90 hover:border-[#FF3E00]/50 text-xs font-mono font-bold uppercase tracking-wider text-[#F8FAFC] transition-colors flex items-center backdrop-blur-sm"
                >
                  Open Ghost Funder &rarr;
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </PerfProvider>
  );
}
