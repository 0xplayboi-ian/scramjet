"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

interface PerfContextValue {
  low: boolean;
  setLow: React.Dispatch<React.SetStateAction<boolean>>;
  osReduced: boolean;
  forceReduced: boolean;
  setForceReduced: React.Dispatch<React.SetStateAction<boolean>>;
  motionOff: boolean;
  post: boolean;
}

const PerfContext = createContext<PerfContextValue | null>(null);

function detectLowPower(): boolean {
  if (typeof window === "undefined") return true;
  const narrow = window.innerWidth < 800;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const nav = navigator as unknown as { connection?: { saveData?: boolean }; deviceMemory?: number };
  const saveData = nav.connection?.saveData;
  const lowMemory = nav.deviceMemory && nav.deviceMemory <= 4;
  return Boolean(narrow || coarse || saveData || lowMemory);
}

export function PerfProvider({ children }: { children: React.ReactNode }) {
  const [low, setLow] = useState<boolean>(detectLowPower);
  const [osReduced, setOsReduced] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [forceReduced, setForceReduced] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setOsReduced(motion.matches);
    motion.addEventListener("change", onMotion);
    return () => motion.removeEventListener("change", onMotion);
  }, []);

  const motionOff = osReduced || forceReduced;

  useEffect(() => {
    document.documentElement.classList.toggle("motion-off", motionOff);
    document.documentElement.classList.toggle("power-low", low);
  }, [motionOff, low]);

  const value = useMemo(
    () => ({
      low,
      setLow,
      osReduced,
      forceReduced,
      setForceReduced,
      motionOff,
      post: !low && !motionOff,
    }),
    [low, osReduced, forceReduced, motionOff]
  );

  return <PerfContext.Provider value={value}>{children}</PerfContext.Provider>;
}

export function usePerf(): PerfContextValue {
  const value = useContext(PerfContext);
  if (!value) {
    return {
      low: false,
      setLow: () => {},
      osReduced: false,
      forceReduced: false,
      setForceReduced: () => {},
      motionOff: false,
      post: true,
    };
  }
  return value;
}
