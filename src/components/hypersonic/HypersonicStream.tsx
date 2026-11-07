"use client";

import React, { useEffect, useRef } from "react";
import { usePerf } from "../perf/PerfProvider";

export function HypersonicStream() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { low, motionOff } = usePerf();

  useEffect(() => {
    if (motionOff) return undefined;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    let animId = 0;
    const streakCount = low ? 25 : 65;
    const gridSpacing = 44;

    interface Streak {
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;
      width: number;
      hue: string;
    }

    const streaks: Streak[] = [];
    function initStreaks() {
      streaks.length = 0;
      for (let i = 0; i < streakCount; i++) {
        streaks.push({
          x: Math.random() * (width || 600),
          y: Math.random() * (height || 360),
          length: 40 + Math.random() * 110,
          speed: (low ? 2 : 4) + Math.random() * (low ? 3 : 7),
          opacity: 0.2 + Math.random() * 0.5,
          width: 0.8 + Math.random() * 1.5,
          hue: Math.random() > 0.75 ? "#FF7700" : "#FF3E00",
        });
      }
    }

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = low ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width || 600;
      height = Math.max(340, rect.height || 340);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (streaks.length === 0) initStreaks();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetX = mouseX;
    let targetY = mouseY;

    const onPointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const render = () => {
      mouseX += (targetX - mouseX) * 0.08;
      mouseY += (targetY - mouseY) * 0.08;

      ctx.fillStyle = "rgba(8, 9, 12, 0.45)";
      ctx.fillRect(0, 0, width, height);

      // Coordinate Grid Dots
      const cols = Math.ceil(width / gridSpacing);
      const rows = Math.ceil(height / gridSpacing);
      const maxProximity = low ? 120 : 180;

      for (let c = 0; c <= cols; c++) {
        const x = c * gridSpacing;
        for (let r = 0; r <= rows; r++) {
          const y = r * gridSpacing;
          const dist = Math.hypot(x - mouseX, y - mouseY);

          if (dist < maxProximity) {
            const glow = (1 - dist / maxProximity) * 0.65;
            ctx.fillStyle = `rgba(255, 62, 0, ${glow})`;
            ctx.beginPath();
            ctx.arc(x, y, 1.8, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = "rgba(28, 37, 51, 0.4)";
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }

      // Supersonic particle streaks
      for (let i = 0; i < streaks.length; i++) {
        const s = streaks[i];
        s.x += s.speed;
        if (s.x > width + s.length) {
          s.x = -s.length;
          s.y = Math.random() * height;
        }

        const grad = ctx.createLinearGradient(s.x, s.y, s.x + s.length, s.y);
        grad.addColorStop(0, "rgba(255, 62, 0, 0)");
        grad.addColorStop(0.7, s.hue);
        grad.addColorStop(1, "#FFFFFF");

        ctx.strokeStyle = grad;
        ctx.lineWidth = s.width;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + s.length, s.y);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [low, motionOff]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[320px] rounded-xl border border-[#1C2533] bg-[#08090C] overflow-hidden my-8 shadow-[0_12px_40px_rgba(0,0,0,0.8)]"
    >
      {motionOff ? (
        <img
          src="/fallbacks/hypersonic.svg"
          alt="Hypersonic stream static fallback"
          className="w-full h-full object-cover opacity-60"
        />
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" aria-hidden="true" />
      )}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF3E00] animate-ping" />
          <span className="font-mono text-[10px] font-bold text-[#FF7700] tracking-wider uppercase bg-[#FF7700]/10 border border-[#FF7700]/30 px-2 py-0.5 rounded">
            MACH 3.5 HYPERSONIC FLOW
          </span>
        </div>
        <p className="font-mono text-[11px] text-[#8E9AA8]">
          Cursor proximity warps grid coordinate lattice; particle velocity throttles to network throughput.
        </p>
      </div>
      <div className="absolute bottom-4 right-4 z-10 font-mono text-[10px] text-[#636879] flex items-center gap-4 pointer-events-none">
        <span>THROUGHPUT: <strong className="text-[#F8FAFC]">65,000 TPS</strong></span>
        <span>SLOT LATENCY: <strong className="text-[#FF7700]">388 MS</strong></span>
      </div>
    </div>
  );
}
