"use client";

import { useEffect, useRef, useState } from "react";
import { usePerf } from "../perf/PerfProvider";

export function InstrumentDial() {
  const dialRef = useRef<HTMLDivElement>(null);
  const [mach, setMach] = useState(1.0);
  const [scrollPct, setScrollPct] = useState(0);
  const [solanaSlot, setSolanaSlot] = useState(312894100);
  const { motionOff } = usePerf();

  useEffect(() => {
    let lastY = typeof window !== "undefined" ? window.scrollY : 0;
    let velocity = 0;
    let rafId: number;

    const onScroll = () => {
      const currentY = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const pct = Math.min(100, Math.max(0, Math.round((currentY / max) * 100)));
      setScrollPct(pct);

      // Scroll velocity converted to hypersonic Mach speed (Mach 1.0 to Mach 10.0)
      const dy = Math.abs(currentY - lastY);
      velocity = Math.min(9.0, dy * 0.12);
      lastY = currentY;
    };

    const decay = () => {
      velocity *= 0.88;
      const currentMach = Number((1.0 + velocity).toFixed(1));
      setMach((prev) => (Math.abs(prev - currentMach) > 0.05 ? currentMach : prev));

      if (dialRef.current) {
        const deg = (scrollPct / 100) * 270 - 135;
        dialRef.current.style.transform = `rotate(${deg}deg)`;
      }

      rafId = requestAnimationFrame(decay);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    rafId = requestAnimationFrame(decay);

    // Live Solana slot ticker simulation
    const slotTimer = setInterval(() => {
      setSolanaSlot((s) => s + 1);
    }, 400);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
      clearInterval(slotTimer);
    };
  }, [scrollPct]);

  if (motionOff) return null;

  return (
    <aside
      className="fixed bottom-6 right-6 z-40 select-none pointer-events-none hidden md:flex items-center gap-3 p-2.5 rounded-xl bg-[#08090C]/90 backdrop-blur-md border border-[#1C2533] shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
      aria-label="Flight Instrument Telemetry Dial"
    >
      {/* Precision Analog Needle Gauge */}
      <div className="relative w-12 h-12 rounded-full border border-[#1C2533] bg-[#0D1117] flex items-center justify-center overflow-hidden">
        {/* Gauge Ticks */}
        <div className="absolute inset-1 rounded-full border border-dashed border-[#FF7700]/30" />
        {/* Needle */}
        <div
          ref={dialRef}
          className="absolute w-[2px] h-[18px] bg-[#FF3E00] origin-bottom shadow-[0_0_6px_#FF3E00]"
          style={{ bottom: "50%", transform: "rotate(-135deg)", transition: "transform 0.15s ease-out" }}
        />
        {/* Center Pivot */}
        <div className="absolute w-2 h-2 rounded-full bg-[#F8FAFC] border border-[#08090C] z-10" />
      </div>

      {/* Flight Telemetry Readout */}
      <div className="font-mono text-[10px] leading-tight space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[#8E9AA8]">SPEED</span>
          <span className="font-bold text-[#FF7700]">M{mach.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#8E9AA8]">ALTITUDE</span>
          <span className="text-[#F8FAFC]">{scrollPct}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-[#636879]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF7700] animate-pulse" />
          <span>SLOT #{solanaSlot}</span>
        </div>
      </div>
    </aside>
  );
}
