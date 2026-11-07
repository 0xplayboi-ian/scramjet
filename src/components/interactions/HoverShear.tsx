"use client";

import { useEffect } from "react";
import { usePerf } from "../perf/PerfProvider";

export function HoverShear() {
  const { motionOff } = usePerf();

  useEffect(() => {
    if (motionOff || typeof window === "undefined") return undefined;
    if (window.matchMedia("(pointer: coarse)").matches) return undefined;

    const node = document.createElement("div");
    node.className = "scramjet-crosshair";
    node.setAttribute("aria-hidden", "true");
    document.body.appendChild(node);

    let rafId: number;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;

    const move = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
    };

    const loop = () => {
      currentX += (targetX - currentX) * 0.28;
      currentY += (targetY - currentY) * 0.28;
      node.style.transform = `translate(${currentX}px, ${currentY}px)`;
      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", move, { passive: true });
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(rafId);
      node.remove();
    };
  }, [motionOff]);

  return null;
}
