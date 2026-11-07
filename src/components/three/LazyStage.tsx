"use client";

import React, { Component, Suspense, useEffect, useRef, useState } from "react";
import { usePerf } from "../perf/PerfProvider";

interface StageBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface StageBoundaryState {
  failed: boolean;
}

class StageBoundary extends Component<StageBoundaryProps, StageBoundaryState> {
  constructor(props: StageBoundaryProps) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

export interface LazyStageProps {
  scene?: React.ComponentType<{ onReady?: () => void; [key: string]: unknown }>;
  children?: React.ReactNode;
  fallback?: string;
  fallbackSrc?: string;
  label?: string;
  sceneProps?: Record<string, unknown>;
  className?: string;
}

export function LazyStage({
  scene: Scene,
  children,
  fallback = "/fallbacks/intake.svg",
  fallbackSrc,
  label = "Scene",
  sceneProps = {},
  className = "",
}: LazyStageProps) {
  const { motionOff } = usePerf();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const effectiveFallback = fallbackSrc || fallback;

  useEffect(() => {
    if (motionOff) {
      setVisible(false);
      setReady(false);
      return undefined;
    }
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "250px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [motionOff]);

  return (
    <div ref={ref} className={`relative w-full h-full ${className}`}>
      {/* Fallback image */}
      {(!ready || motionOff) && (
        <img
          src={effectiveFallback}
          alt={label}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-700"
          style={{ opacity: ready ? 0 : 1 }}
        />
      )}

      {/* Three.js Canvas */}
      {visible && !motionOff && (
        <StageBoundary
          fallback={
            <img
              src={effectiveFallback}
              alt={label}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          }
        >
          <Suspense fallback={null}>
            {Scene ? (
              <Scene onReady={() => setReady(true)} {...sceneProps} />
            ) : (
              children
            )}
          </Suspense>
        </StageBoundary>
      )}
    </div>
  );
}

export default LazyStage;
