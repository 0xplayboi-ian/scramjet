"use client";

import React, { useState } from "react";

export function AntiMevShield() {
  const [mode, setMode] = useState<"shielded" | "public">("shielded");
  const [attacksBlocked, setAttacksBlocked] = useState(1482);
  const [lastAttacked, setLastAttacked] = useState(false);

  function simulateAttack() {
    setLastAttacked(true);
    setTimeout(() => setLastAttacked(false), 800);
    if (mode === "shielded") {
      setAttacksBlocked((c) => c + 1);
    }
  }

  return (
    <div className="rounded-2xl border border-[#1C2533] bg-[#0A0D14] p-6 lg:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] my-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#1C2533]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-[#FF7700] tracking-wider uppercase bg-[#FF7700]/10 border border-[#FF7700]/30 px-2 py-0.5 rounded">
              PROPOSAL #08 · KINETIC ANTI-MEV DEFLECTOR
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
            Kinetic Anti-MEV Force Field
          </h3>
          <p className="text-xs text-[#8E9AA8]">
            Simulates dynamic deflection physics repelling sandwich bots, toxic arbitrageurs, and mempool front-runners.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => setMode("shielded")}
            className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${
              mode === "shielded"
                ? "bg-[#FF7700]/20 border-[#FF7700] text-[#FF7700]"
                : "bg-[#0E131E] border-[#1C2533] text-[#8E9AA8] hover:text-[#F8FAFC]"
            }`}
          >
            SCRAMJET Private Bundle (Invulnerable)
          </button>
          <button
            type="button"
            onClick={() => setMode("public")}
            className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${
              mode === "public"
                ? "bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444]"
                : "bg-[#0E131E] border-[#1C2533] text-[#8E9AA8] hover:text-[#F8FAFC]"
            }`}
          >
            Public Mempool (Vulnerable)
          </button>
          <button
            type="button"
            onClick={simulateAttack}
            className="px-4 py-1.5 rounded-lg bg-[#FF3E00] hover:bg-[#FF5500] text-black font-extrabold transition-all shadow-[0_0_12px_rgba(255,62,0,0.4)]"
          >
            Simulate Attack
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-center">
        {/* Kinetic Shield Graphic */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="relative w-full max-w-[380px] aspect-square flex items-center justify-center">
            <svg
              viewBox="-150 -150 300 300"
              className={`w-full h-full transition-transform duration-200 ${
                lastAttacked ? "scale-105" : "scale-100"
              }`}
              aria-label="Anti-MEV Kinetic Shield"
            >
              {/* Central Launch Core */}
              <circle cx="0" cy="0" r="30" fill="#0D1117" stroke="#38BDF8" strokeWidth="2" />
              <text
                x="0"
                y="4"
                textAnchor="middle"
                fill="#38BDF8"
                fontSize="9"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                LAUNCH TX
              </text>

              {mode === "shielded" ? (
                <g className="kinetic-shield">
                  {/* Outer Hexagon Force Field */}
                  <polygon
                    points="0,-90 78,-45 78,45 0,90 -78,45 -78,-45"
                    fill="#FF7700"
                    fillOpacity="0.08"
                    stroke="#FF7700"
                    strokeWidth="2.5"
                    strokeDasharray="8 4"
                    className="drop-shadow-[0_0_12px_rgba(255,119,0,0.5)]"
                  />
                  {/* Secondary Buffer Ring */}
                  <circle
                    cx="0"
                    cy="0"
                    r="62"
                    fill="none"
                    stroke="#FF3E00"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.7"
                  />

                  {/* Deflected Attack Sparks */}
                  <line x1="-140" y1="-80" x2="-70" y2="-40" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="3 3" />
                  <line x1="-70" y1="-40" x2="-130" y2="0" stroke="#FF7700" strokeWidth="2" />
                  <circle cx="-70" cy="-40" r="5" fill="#FF7700" className="animate-ping" />

                  <line x1="140" y1="70" x2="72" y2="38" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="3 3" />
                  <line x1="72" y1="38" x2="120" y2="120" stroke="#FF7700" strokeWidth="2" />
                  <circle cx="72" cy="38" r="5" fill="#FF7700" className="animate-ping" />
                </g>
              ) : (
                <g className="vulnerable-mempool">
                  {/* Broken Perimeters */}
                  <circle cx="0" cy="0" r="80" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="2 6" opacity="0.6" />
                  {/* Direct Piercing Sandwich Beams */}
                  <line x1="-145" y1="-50" x2="-22" y2="-10" stroke="#EF4444" strokeWidth="3" />
                  <line x1="145" y1="40" x2="22" y2="10" stroke="#EF4444" strokeWidth="3" />
                  <circle cx="-22" cy="-10" r="6" fill="#EF4444" className="animate-ping" />
                  <circle cx="22" cy="10" r="6" fill="#EF4444" className="animate-ping" />
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Telemetry Stats */}
        <div className="lg:col-span-5 space-y-4 font-mono text-xs">
          <div className="p-4 rounded-xl border border-[#1C2533] bg-[#0E131E] space-y-1">
            <span className="text-[#8E9AA8] text-[10px]">TOTAL MEV SANDWICH ATTACKS BLOCKED</span>
            <div className="text-2xl font-bold text-[#FF7700]">{attacksBlocked.toLocaleString()}</div>
          </div>

          <div className="p-4 rounded-xl border border-[#1C2533] bg-[#0E131E] space-y-1">
            <span className="text-[#8E9AA8] text-[10px]">SLIPPAGE CORRIDOR INTEGRITY</span>
            <div className="text-xl font-bold text-[#F8FAFC]">
              {mode === "shielded" ? (
                <span className="text-[#FF7700]">100% Locked (Zero Leakage)</span>
              ) : (
                <span className="text-[#EF4444]">Compromised (Up to 14.8% Sandwich)</span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#1C2533] bg-[#0E131E] space-y-1">
            <span className="text-[#8E9AA8] text-[10px]">VALIDATOR SCHEDULING GUARANTEE</span>
            <div className="text-base font-bold text-[#F8FAFC]">
              {mode === "shielded" ? (
                <span className="text-[#38BDF8]">Jito Block-0 Atomic Bundle</span>
              ) : (
                <span className="text-[#636879]">Public Gossip Protocol (Exposed)</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
