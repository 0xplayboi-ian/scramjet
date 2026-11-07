"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

/** Fixed top-of-viewport scroll progress bar in plasma orange. */
export function ScrollProgressBar() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setPct(Math.min(100, Math.max(0, (window.scrollY / max) * 100)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-[9998] pointer-events-none bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-[#FF3E00] via-[#FF7700] to-[#31E3AC] shadow-[0_0_12px_#FF7700]"
        style={{ width: `${pct}%`, transition: "width 80ms linear" }}
      />
    </div>
  );
}

/** Fades/slides children in once when scrolled into view. */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-[850ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        shown ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-10 blur-[2px]"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/** Big editorial chapter that sits between animation sections. */
export function Chapter({
  number,
  kicker,
  title,
  accent,
  body,
  points,
  badge,
}: {
  number: string;
  kicker: string;
  title: string;
  accent: string;
  body: string;
  points?: { label: string; text: string }[];
  badge?: string;
}) {
  return (
    <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-14 sm:pt-36 sm:pb-16">
      {/* Giant Background Outlined Chapter Number */}
      <div
        aria-hidden
        className="absolute left-2 sm:left-6 top-8 text-[130px] sm:text-[210px] font-black leading-none text-transparent select-none pointer-events-none font-mono"
        style={{ WebkitTextStroke: "1px rgba(255,119,0,0.13)" }}
      >
        {number}
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-7 space-y-5">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 text-[11px] font-mono font-bold tracking-[0.25em] uppercase text-[#FF7700]">
                <span className="w-8 h-px bg-[#FF7700]" />
                CHAPTER {number} // {kicker}
              </span>
              {badge && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#FF3E00]/10 border border-[#FF3E00]/30 text-[10px] font-mono text-[#FF7700] uppercase">
                  {badge}
                </span>
              )}
            </div>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.05] text-[#F8FAFC]">
              {title}{" "}
              <span className="bg-gradient-to-r from-[#FF3E00] via-[#FF7700] to-[#FFA040] bg-clip-text text-transparent">
                {accent}
              </span>
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="text-base sm:text-lg text-[#8E9AA8] leading-relaxed max-w-2xl">{body}</p>
          </Reveal>
        </div>

        {points && (
          <div className="lg:col-span-5 space-y-3">
            {points.map((p, i) => (
              <Reveal key={p.label} delay={140 + i * 110}>
                <div className="group p-4 rounded-xl border border-[#1C202B] bg-[#0A0C10]/90 hover:border-[#FF3E00]/50 transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#FF7700]">
                      0{i + 1} // {p.label}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF3E00]/60 group-hover:bg-[#31E3AC] transition-colors" />
                  </div>
                  <div className="text-xs sm:text-sm text-[#C5CCD6] leading-relaxed">{p.text}</div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CountUp({
  to,
  suffix = "",
  prefix = "",
  decimals = 0,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const dur = 1400;
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / dur);
        setVal(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(node);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);

  return (
    <span ref={ref}>
      {prefix}
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export function StatsStrip() {
  const stats = [
    { to: 3.5, suffix: "%", decimals: 1, label: "Platform Fee", sub: "30% lower than Proxima (5.0%)" },
    { to: 0.01, prefix: "", suffix: " SOL", decimals: 2, label: "Min Sub-Wallet", sub: "10x lower capital lockup" },
    { to: 12, suffix: " DEXs", decimals: 0, label: "Native Protocols", sub: "Pump.fun, Meteora, Raydium & more" },
    { to: 0.0, suffix: "%", decimals: 1, label: "Cluster Risk", sub: "Multi-hop Merkle relay dispersion" },
  ];
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-[#1C202B] bg-[#1C202B] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 90} className="bg-[#090B10]">
            <div className="p-6 sm:p-8 text-center hover:bg-[#0D1017] transition-colors">
              <div className="text-3xl sm:text-5xl font-extrabold font-mono text-[#FF7700]">
                <CountUp to={s.to} suffix={s.suffix} prefix={s.prefix} decimals={s.decimals} />
              </div>
              <div className="mt-2.5 text-xs font-bold uppercase tracking-widest text-[#F8FAFC]">{s.label}</div>
              <div className="text-[11px] font-mono text-[#717686] mt-1">{s.sub}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-[#14161F] bg-[#0A0B0E] py-4 my-6" aria-hidden>
      <div className="flex w-max gap-10 animate-marquee text-xs font-mono font-bold uppercase tracking-[0.28em] text-[#647084]">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap">
            {t}
            <span className="text-[#FF7700]">&#9670;</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** 3-column architectural deep-dive cards to give context between heavy visual stages. */
export function DeepDiveTriad({
  items,
}: {
  items: { tag: string; title: string; body: string; metric: string }[];
}) {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((item, i) => (
          <Reveal key={item.title} delay={i * 110}>
            <div className="p-6 rounded-2xl border border-[#1C202B] bg-gradient-to-b from-[#0C0E14] to-[#08090C] hover:border-[#FF3E00]/40 transition-all h-full flex flex-col justify-between space-y-5">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#FF7700]">
                  <span>{item.tag}</span>
                  <span className="text-[#31E3AC]">● VERIFIED</span>
                </div>
                <h3 className="text-lg font-bold text-[#F8FAFC] tracking-tight">{item.title}</h3>
                <p className="text-xs sm:text-sm text-[#8E9AA8] leading-relaxed">{item.body}</p>
              </div>
              <div className="pt-3 border-t border-[#161922] flex items-center justify-between text-xs font-mono">
                <span className="text-[#717686]">BENCHMARK</span>
                <span className="text-[#F8FAFC] font-bold">{item.metric}</span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    {
      n: "01",
      t: "Connect & Provision Enclave",
      d: "Link your Solana wallet. Up to 24 sub-wallet keypairs are provisioned inside a non-custodial Turnkey hardware enclave—never exposed in plain text.",
    },
    {
      n: "02",
      t: "Configure Protocol & Curve",
      d: "Choose from 12 native Solana launchpads (Pump.fun, Meteora DBC, Raydium LaunchLab, Bags, LetsBonk) and set Block-0, Organic, or Manual execution.",
    },
    {
      n: "03",
      t: "Disperse via Merkle Relays",
      d: "Ghost Funder routes SOL through ephemeral intermediate relays with randomized ±7.5% lamport jitter so BubbleMaps sees zero single-parent clusters.",
    },
    {
      n: "04",
      t: "Atomic Block-0 Ignition",
      d: "Token creation and initial sub-wallet buys land atomically in the exact same Solana slot via Jito private block engines, with automatic ATA rent reclaim afterwards.",
    },
  ];
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
      <Reveal>
        <div className="text-center space-y-3 mb-14">
          <span className="text-[11px] font-mono font-bold tracking-[0.25em] uppercase text-[#FF7700]">
            EXECUTION PIPELINE // HOW IT WORKS
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F8FAFC]">
            From concept to Block-0 in four moves.
          </h2>
          <p className="text-sm sm:text-base text-[#8E9AA8] max-w-2xl mx-auto">
            Every step of the Scramjet workflow is engineered to eliminate front-running, prevent wallet graph clustering, and minimize SOL overhead.
          </p>
        </div>
      </Reveal>
      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-[#FF3E00]/50 to-transparent" />
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 120}>
            <div className="relative p-6 rounded-2xl border border-[#1C202B] bg-[#0A0C10] h-full hover:-translate-y-1 hover:border-[#FF3E00]/50 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF3E00] to-[#FF7700] text-black font-mono font-black text-sm flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(255,62,0,0.45)]">
                  {s.n}
                </div>
                <h3 className="text-base font-bold text-[#F8FAFC] mb-2">{s.t}</h3>
                <p className="text-xs sm:text-sm text-[#8E9AA8] leading-relaxed">{s.d}</p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#151821] text-[10px] font-mono uppercase tracking-wider text-[#FF7700]">
                STAGE {s.n} READY &rarr;
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** Side-by-side comparison table before the calculator. */
export function ProtocolComparisonTable() {
  const rows = [
    { feature: "Creator Harvest / Platform Fee", scramjet: "3.5% (VIP: 0.0%)", proxima: "5.0% Flat", manual: "N/A (High Slippage)" },
    { feature: "Minimum Sub-Wallet Funding", scramjet: "0.01 SOL", proxima: "0.10 SOL Lockup", manual: "Manual Transfers" },
    { feature: "Anti-BubbleMaps Clustering", scramjet: "Cryptographic Merkle Relays", proxima: "$45k/mo SOW Retainer", manual: "100% Exposed" },
    { feature: "Block-0 Jito Bundle Routing", scramjet: "5 Private Block Engines", proxima: "Single Endpoint", manual: "Public Mempool" },
    { feature: "Empty Token Account Rent Sweep", scramjet: "Auto Reclaim (+0.00204 SOL/w)", proxima: "Abandoned", manual: "Manual CLI Close" },
    { feature: "Post-Launch Market Maker", scramjet: "Photon Bumper + Green TWAP", proxima: "Manual Trades Only", manual: "None" },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <Reveal>
        <div className="rounded-2xl border border-[#1C202B] bg-[#090B10] overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-[#1C202B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF7700] font-bold">
                HEAD-TO-HEAD TELEMETRY
              </span>
              <h3 className="text-2xl font-bold text-[#F8FAFC] mt-1">
                Scramjet vs Legacy Bundlers
              </h3>
            </div>
            <Link
              href="/launch"
              className="px-4 py-2 rounded-lg bg-[#FF3E00]/15 border border-[#FF3E00]/40 text-[#FF7700] hover:bg-[#FF3E00] hover:text-black font-mono text-xs font-bold transition-all self-start sm:self-auto"
            >
              Inspect Full Spec in Launch HUD &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-[#1C202B] bg-[#06070A] text-[#717686] text-[10px] uppercase tracking-wider">
                  <th className="py-3.5 px-5">Capability / Metric</th>
                  <th className="py-3.5 px-5 text-[#FF7700]">Scramjet Mach 3.5</th>
                  <th className="py-3.5 px-5">Proxima Tools</th>
                  <th className="py-3.5 px-5">Raw Manual Deploy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141720]">
                {rows.map((r) => (
                  <tr key={r.feature} className="hover:bg-[#0D1017] transition-colors">
                    <td className="py-4 px-5 font-sans font-semibold text-[#F8FAFC]">{r.feature}</td>
                    <td className="py-4 px-5 text-[#31E3AC] font-bold">{r.scramjet}</td>
                    <td className="py-4 px-5 text-[#8E9AA8]">{r.proxima}</td>
                    <td className="py-4 px-5 text-[#636879]">{r.manual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
