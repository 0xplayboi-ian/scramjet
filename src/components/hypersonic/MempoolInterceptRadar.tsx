"use client";

import React, { useEffect, useState } from "react";
import { usePerf } from "../perf/PerfProvider";

export function MempoolInterceptRadar() {
  const [range] = useState(400);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState<"all" | "shielded" | "neutralized">("all");
  const [angle, setAngle] = useState(0);
  const [blips, setBlips] = useState([
    { id: 1, angle: 45, dist: 0.72, sig: "tx_9xJ1..8a", type: "shielded", fee: "0.015 SOL", time: "4ms ago" },
    { id: 2, angle: 120, dist: 0.45, sig: "bot_3mB..2e", type: "neutralized", fee: "0.080 SOL", time: "12ms ago" },
    { id: 3, angle: 210, dist: 0.85, sig: "tx_4kJ9..7f", type: "shielded", fee: "0.020 SOL", time: "18ms ago" },
    { id: 4, angle: 300, dist: 0.35, sig: "sniper_91..1c", type: "neutralized", fee: "0.120 SOL", time: "22ms ago" },
    { id: 5, angle: 340, dist: 0.60, sig: "tx_2vQ4..9k", type: "shielded", fee: "0.010 SOL", time: "28ms ago" },
  ]);

  const { motionOff } = usePerf();

  useEffect(() => {
    if (motionOff || paused) return undefined;
    const interval = setInterval(() => {
      setAngle((prev) => (prev + 3) % 360);
    }, 24);
    return () => clearInterval(interval);
  }, [motionOff, paused]);

  function triggerSweep() {
    const newBlip = {
      id: Date.now(),
      angle: Math.floor(Math.random() * 360),
      dist: 0.3 + Math.random() * 0.6,
      sig: `tx_${Math.random().toString(36).slice(2, 6)}..${Math.random().toString(36).slice(2, 4)}`,
      type: (Math.random() > 0.4 ? "shielded" : "neutralized") as "shielded" | "neutralized",
      fee: `${(0.01 + Math.random() * 0.05).toFixed(3)} SOL`,
      time: "just now",
    };
    setBlips((prev) => [newBlip, ...prev.slice(0, 5)]);
  }

  const visibleBlips = blips.filter((b) => filter === "all" || b.type === filter);

  return (
    <div className="rounded-2xl border border-[#1C2533] bg-[#0A0D14] p-6 lg:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] my-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#1C2533]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-[#FF7700] tracking-wider uppercase bg-[#FF7700]/10 border border-[#FF7700]/30 px-2 py-0.5 rounded">
              PROPOSAL #07 · MEMPOOL INTERCEPT RADAR
            </span>
            <span className="w-2 h-2 rounded-full bg-[#FF7700] animate-ping" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
            360° Real-Time Mempool Sonar
          </h3>
          <p className="text-xs text-[#8E9AA8]">
            Intercepts unconfirmed Solana transactions, neutralizes sandwich bots, and routes safe bundles straight to Jito Block-0.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => setPaused(!paused)}
            className="px-3 py-1.5 rounded-lg border border-[#1C2533] bg-[#0E131E] hover:border-[#FF7700]/40 text-[#8E9AA8] hover:text-[#F8FAFC] transition-all"
          >
            {paused ? "Resume Sweep" : "Freeze"}
          </button>
          <button
            type="button"
            onClick={triggerSweep}
            className="px-4 py-1.5 rounded-lg bg-[#FF3E00] hover:bg-[#FF5500] text-black font-extrabold transition-all shadow-[0_0_12px_rgba(255,62,0,0.4)]"
          >
            Ping Mempool
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-center">
        {/* Sonar Radar Screen */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-[340px] aspect-square">
            <svg
              className="w-full h-full drop-shadow-[0_0_24px_rgba(255,119,0,0.2)]"
              viewBox="-120 -120 240 240"
              aria-label="Mempool Intercept Sonar"
            >
              {/* Background */}
              <circle cx="0" cy="0" r="115" fill="#08090C" stroke="#1C2533" strokeWidth="1.5" />

              {/* Range Rings */}
              <circle cx="0" cy="0" r="30" fill="none" stroke="#FF7700" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.35" />
              <circle cx="0" cy="0" r="60" fill="none" stroke="#FF7700" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.35" />
              <circle cx="0" cy="0" r="90" fill="none" stroke="#FF7700" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.35" />
              <circle cx="0" cy="0" r="115" fill="none" stroke="#FF7700" strokeWidth="1.2" opacity="0.6" />

              {/* Crosshairs */}
              <line x1="-115" y1="0" x2="115" y2="0" stroke="#1C2533" strokeWidth="1" />
              <line x1="0" y1="-115" x2="0" y2="115" stroke="#1C2533" strokeWidth="1" />

              {/* Radar Sweep Hand */}
              <g transform={`rotate(${angle})`}>
                <line x1="0" y1="0" x2="0" y2="-115" stroke="#FF7700" strokeWidth="2" opacity="0.9" />
                <polygon points="0,0 -45,-115 0,-115" fill="url(#mempoolGlow)" opacity="0.3" />
              </g>

              <defs>
                <linearGradient id="mempoolGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF7700" stopOpacity="0" />
                  <stop offset="100%" stopColor="#FF7700" stopOpacity="0.45" />
                </linearGradient>
              </defs>

              {/* Center Scramjet Node */}
              <circle cx="0" cy="0" r="5" fill="#FF7700" />
              <circle cx="0" cy="0" r="9" fill="none" stroke="#FF7700" strokeWidth="1" opacity="0.7" />

              {/* Plotted Blips */}
              {visibleBlips.map((blip) => {
                const rad = ((blip.angle - 90) * Math.PI) / 180;
                const r = blip.dist * 105;
                const bx = Math.cos(rad) * r;
                const by = Math.sin(rad) * r;
                const isDanger = blip.type === "neutralized";
                const color = isDanger ? "#EF4444" : "#FF7700";

                return (
                  <g key={blip.id} transform={`translate(${bx}, ${by})`}>
                    <circle cx="0" cy="0" r="4.5" fill={color} />
                    <circle cx="0" cy="0" r="10" fill="none" stroke={color} strokeWidth="1" opacity="0.5" className="animate-ping" />
                    <text x="8" y="3" fill="#F8FAFC" fontSize="7" fontFamily="JetBrains Mono" opacity="0.9">
                      {blip.sig}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="w-full max-w-[340px] flex justify-between font-mono text-[10px] text-[#8E9AA8] pt-3">
            <span>RANGE: {range}MS</span>
            <span className={paused ? "text-[#FF3E00]" : "text-[#FF7700] font-bold"}>
              {paused ? "SWEEP PAUSED" : "● INTERCEPT ACTIVE"}
            </span>
          </div>
        </div>

        {/* Live Intercept Signal Feed */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex gap-2">
            {(["all", "shielded", "neutralized"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setFilter(mode)}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${
                  filter === mode
                    ? "bg-[#FF7700]/20 text-[#FF7700] border border-[#FF7700]/50"
                    : "bg-[#0E131E] text-[#8E9AA8] border border-[#1C2533] hover:text-[#F8FAFC]"
                }`}
              >
                {mode === "all" ? "All Signals" : mode === "shielded" ? "Shielded Bundles" : "Snipers Neutralized"}
              </button>
            ))}
          </div>

          <div className="space-y-2 font-mono text-xs max-h-[260px] overflow-y-auto pr-1">
            {visibleBlips.map((blip) => (
              <div
                key={blip.id}
                className="flex items-center justify-between p-3 rounded-lg border border-[#1C2533] bg-[#0E131E]/80 backdrop-blur"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      blip.type === "shielded"
                        ? "bg-[#FF7700]/15 text-[#FF7700] border border-[#FF7700]/30"
                        : "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30"
                    }`}
                  >
                    {blip.type === "shielded" ? "SHIELDED" : "NEUTRALIZED"}
                  </span>
                  <span className="text-[#F8FAFC] font-semibold">{blip.sig}</span>
                </div>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="text-[#FF7700]">{blip.fee}</span>
                  <span className="text-[#636879]">{blip.time}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-[#8E9AA8] leading-relaxed pt-2">
            Unlike legacy launchpads that broadcast raw transactions to public validators, SCRAMJET encapsulates trades inside atomic Jito bundles that bypass the public mempool entirely.
          </p>
        </div>
      </div>
    </div>
  );
}
