"use client";

import React from "react";

export function SectionVeil({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative w-full h-16 pointer-events-none overflow-hidden my-4 ${className}`}
      aria-hidden="true"
    >
      {/* Aerodynamic Speed-Line Grid */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FF3E00]/5 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-between px-8 opacity-25">
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="w-[1px] bg-gradient-to-b from-transparent via-[#FF7700] to-transparent"
            style={{
              height: `${Math.sin(i * 0.4) * 28 + 32}px`,
              opacity: 0.2 + (i % 3) * 0.3,
            }}
          />
        ))}
      </div>
      {/* Center Razor Mach Line */}
      <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF7700]/40 to-transparent -translate-y-1/2" />
    </div>
  );
}
