"use client";

import React, { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "../scroll/SmoothScroll";
import { usePerf } from "../perf/PerfProvider";
import LazyStage from "../three/LazyStage";
import CascadeScene from "../three/CascadeScene";

const CHAPTERS = [
  {
    k: "01",
    title: "Name it",
    copy: "Set ticker, supply, metadata, and curve parameters. Choose classic bonding curve or Meteora dynamic fee tiers.",
    spec: "SPL Token / Dynamic Curve",
  },
  {
    k: "02",
    title: "Pick a venue",
    copy: "Deploy across Pump.fun, Meteora DBC, Raydium LaunchLab, Bags, LetsBonk, and 7 other native Solana launchpads.",
    spec: "12 Native DEX Protocols",
  },
  {
    k: "03",
    title: "Fund the wallet",
    copy: "Disperse SOL across up to 24 Turnkey enclave sub-wallets via multi-hop Merkle relays with randomized lamport jitter.",
    spec: "0.01 SOL Min • 0% Cluster Risk",
  },
  {
    k: "04",
    title: "Confirm & Launch",
    copy: "Mint creation and all sub-wallet buys land atomically in Block-0 via 5 private Jito block engines, with automatic ATA rent reclaim.",
    spec: "Single-Slot Jito Block-0",
  },
];

/** #25: Sticky scroll-scrubbed progress rail sequence */
export const ChapterRail: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const { motionOff } = usePerf();

  useEffect(() => {
    if (motionOff || !rootRef.current) return undefined;
    const trigger = ScrollTrigger.create({
      trigger: rootRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${self.progress})`;
        }
        const idx = Math.min(CHAPTERS.length - 1, Math.floor(self.progress * CHAPTERS.length));
        setActiveIdx(idx);
      },
    });
    return () => trigger.kill();
  }, [motionOff]);

  return (
    <div ref={rootRef} className={motionOff ? "py-16" : "relative h-[240vh]"}>
      <div className={motionOff ? "" : "sticky top-16 py-12 flex flex-col justify-center min-h-[75vh]"}>
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold tracking-[0.25em] uppercase text-[#FF7700]">
                LAUNCH SEQUENCE // FOUR STEPS
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F8FAFC] mt-2">
                From zero to Block-0 in four beats.
              </h2>
            </div>
            <span className="text-xs font-mono text-[#8E9AA8]">
              STAGE 0{activeIdx + 1} / 04 ACTIVE
            </span>
          </div>

          {/* Horizontal Progress Rail */}
          <div className="relative h-1 w-full bg-[#1C202B] rounded-full overflow-hidden">
            <div
              ref={barRef}
              className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-[#FF3E00] via-[#FF7700] to-[#31E3AC] origin-left transition-transform duration-75"
              style={{ transform: motionOff ? "scaleX(1)" : "scaleX(0.15)" }}
            />
          </div>

          {/* 4 Chapter Steps */}
          <ol className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {CHAPTERS.map((chapter, index) => {
              const isOn = motionOff || index <= activeIdx;
              const isCurrent = index === activeIdx;
              return (
                <li
                  key={chapter.k}
                  onClick={() => setActiveIdx(index)}
                  className={`cursor-pointer p-6 rounded-2xl border transition-all duration-500 ${
                    isCurrent
                      ? "border-[#FF3E00] bg-[#0D1017] shadow-[0_0_30px_rgba(255,62,0,0.14)] -translate-y-1"
                      : isOn
                      ? "border-[#FF7700]/40 bg-[#0A0C10] opacity-90"
                      : "border-[#1C202B] bg-[#08090C]/60 opacity-45"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded ${
                        isCurrent
                          ? "bg-[#FF3E00] text-black"
                          : isOn
                          ? "bg-[#FF3E00]/15 text-[#FF7700]"
                          : "bg-[#141720] text-[#717686]"
                      }`}
                    >
                      {chapter.k}
                    </span>
                    <span className="text-[10px] font-mono text-[#717686]">{chapter.spec}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">{chapter.title}</h3>
                  <p className="text-xs sm:text-sm text-[#8E9AA8] leading-relaxed">{chapter.copy}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
};

/** #26: Pinned scroll-scrubbed 3D Cascade Chamber wind tunnel */
export const CascadeChamberSection: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<number>(0);
  const [activeStep, setActiveStep] = useState(0);
  const { motionOff } = usePerf();

  useEffect(() => {
    if (motionOff || !trackRef.current) return undefined;
    const trigger = ScrollTrigger.create({
      trigger: trackRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.4,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        const idx = Math.min(CHAPTERS.length - 1, Math.floor(self.progress * CHAPTERS.length));
        setActiveStep(idx);
      },
    });
    return () => trigger.kill();
  }, [motionOff]);

  return (
    <div ref={trackRef} className={motionOff ? "py-16" : "relative h-[260vh]"}>
      <div className={motionOff ? "" : "sticky top-14 h-[85vh] flex items-center"}>
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6">
          <div className="relative rounded-2xl border border-[#FF3E00]/30 bg-[#06070A] overflow-hidden h-[540px] sm:h-[600px] shadow-[0_0_50px_rgba(255,62,0,0.08)]">
            {/* Full-bleed 3D Cascade Chamber Canvas */}
            <div className="absolute inset-0">
              <LazyStage fallbackSrc="/fallbacks/cascade.svg">
                <CascadeScene onReady={() => {}} progressRef={progressRef} />
              </LazyStage>
            </div>

            {/* Overlay Telemetry Header */}
            <div className="relative z-10 p-6 sm:p-8 flex flex-col justify-between h-full pointer-events-none">
              <div className="flex items-center justify-between">
                <div className="px-3 py-1.5 rounded-lg bg-[#08090C]/85 border border-[#1C202B] backdrop-blur-md">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF7700] font-bold">
                    SUPERSONIC CASCADE CHAMBER // Z-TUNNEL SCRUB
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-[#08090C]/85 border border-[#1C202B] backdrop-blur-md text-xs font-mono text-[#31E3AC]">
                  CHAMBER 0{activeStep + 1} LOCKED
                </div>
              </div>

              {/* Bottom Overlay Step Readout */}
              <ol className="grid grid-cols-2 lg:grid-cols-4 gap-3 pointer-events-auto">
                {CHAPTERS.map((chapter, idx) => {
                  const isActive = idx === activeStep;
                  return (
                    <li
                      key={chapter.k}
                      onClick={() => {
                        setActiveStep(idx);
                        progressRef.current = idx / (CHAPTERS.length - 1);
                      }}
                      className={`cursor-pointer p-4 rounded-xl border backdrop-blur-md transition-all ${
                        isActive
                          ? "bg-[#0B0E14]/90 border-[#FF3E00] text-[#F8FAFC]"
                          : "bg-[#08090C]/70 border-[#1C202B]/80 text-[#8E9AA8] opacity-60 hover:opacity-90"
                      }`}
                    >
                      <div className="text-[10px] font-mono text-[#FF7700] font-bold mb-1">
                        CHAMBER {chapter.k}
                      </div>
                      <div className="text-sm font-bold text-[#F8FAFC]">{chapter.title}</div>
                      <p className="text-[11px] text-[#8E9AA8] mt-1 line-clamp-2">{chapter.copy}</p>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ChapterCascadeRail = ChapterRail;
