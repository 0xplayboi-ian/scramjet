import { useEffect, useRef, useState } from "react";
import { Block } from "./Block.jsx";
import { usePerf } from "../perf/PerfProvider.jsx";
import { usePrototype } from "../prototype/PrototypeContext.jsx";

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
const FINAL_LINE = "HYPERSONIC LAUNCH";
const BOOT_LINES = [
  "BOOT SEQUENCE",
  "VENUES 12 ONLINE",
  "FEE LOCK 3.5%",
  "WALLET ARMED",
  "CONFIRM READY",
];
const TABS = [
  { id: "fee", label: "Fee", copy: "The protocol fee is 3.5%. The comparison on the live site is 5.0%." },
  { id: "venues", label: "Venues", copy: "One flow deploys across Solana venues. The marks are objects you can turn." },
  { id: "speed", label: "Speed", copy: "The page should feel fast before the fee is read. The words stay in the DOM." },
];
const FACTS = [
  ["12", "venues"],
  ["3.5", "percent fee"],
  ["5.0", "comparison"],
  ["4", "beats"],
];
const RUNWAY = [12, 3.5, 5];

function useOn(id) {
  const { isActive } = usePrototype();
  return isActive(id);
}

export function VelocityMarquee() {
  return (
    <Block id="velocity-marquee">
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {Array.from({ length: 2 }, (_, copy) => (
            <p key={copy}>
              Pump.fun · Meteora · Raydium · Bags · Bonk.fun · Stonk.fun · Anoncoin · Surge ·
            </p>
          ))}
        </div>
      </div>
      <p className="sr-only">Pump.fun, Meteora, Raydium, Bags, Bonk.fun, Stonk.fun, Anoncoin, Surge.</p>
    </Block>
  );
}

export function DecodeHeadline() {
  const motionOff = usePerf().motionOff;
  const active = useOn("decode-headline");
  const [text, setText] = useState(FINAL_LINE);
  const timer = useRef(0);

  useEffect(() => () => window.clearInterval(timer.current), []);

  function run() {
    window.clearInterval(timer.current);
    if (!active || motionOff) {
      setText(FINAL_LINE);
      return;
    }
    let frame = 0;
    timer.current = window.setInterval(() => {
      frame += 1;
      const next = FINAL_LINE.split("")
        .map((glyph, index) => {
          if (glyph === " ") return " ";
          if (index < frame / 2) return glyph;
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join("");
      setText(next);
      if (frame > FINAL_LINE.length * 2) {
        window.clearInterval(timer.current);
        setText(FINAL_LINE);
      }
    }, 36);
  }

  return (
    <Block id="decode-headline">
      <p className="decode" aria-live="polite">{text}</p>
      <button type="button" onClick={run}>Decode again</button>
    </Block>
  );
}

export function StickyStack() {
  const cards = [
    ["01", "Name it", "A ticker and one sentence a stranger can repeat."],
    ["02", "Pick a venue", "The mark you turn is the venue you deploy on."],
    ["03", "Fund the wallet", "The launch wallet is funded before the transaction is sent."],
    ["04", "Confirm", "Solana finalizes the launch. The page returns to the terminal."],
  ];
  return (
    <Block id="sticky-stack">
      <div className="stack">
        {cards.map(([k, title, copy]) => (
          <article key={k} className="stack-card">
            <p>{k}</p>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </Block>
  );
}

export function CompareScrub() {
  const [value, setValue] = useState(100);
  const fee = (5 - 1.5 * (value / 100)).toFixed(1);
  return (
    <Block id="compare-scrub">
      <p className="fee-figure" aria-hidden="true">{fee}%</p>
      <label className="range-label">
        Drag from 5.0% toward 3.5%
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
        />
      </label>
      <p>Showing {fee}%. The protocol fee is 3.5%. The comparison is 5.0%.</p>
    </Block>
  );
}

export function Spotlight() {
  const { motionOff } = usePerf();
  const ref = useRef(null);

  function move(event) {
    if (motionOff) return;
    const node = ref.current;
    if (!node) return;
    const bounds = node.getBoundingClientRect();
    node.style.setProperty("--sx", `${event.clientX - bounds.left}px`);
    node.style.setProperty("--sy", `${event.clientY - bounds.top}px`);
  }

  return (
    <Block id="spotlight">
      <div ref={ref} className={motionOff ? "spotlight is-lit" : "spotlight"} onPointerMove={move}>
        <p>3.5% to launch. Twelve venues. One confirmation.</p>
      </div>
    </Block>
  );
}

export function TiltCards() {
  const { motionOff } = usePerf();
  const cards = [
    ["3.5%", "Protocol fee"],
    ["12", "Solana venues"],
    ["4", "Beats to confirm"],
  ];

  function move(event) {
    if (motionOff || window.matchMedia("(pointer: coarse)").matches) return;
    const node = event.currentTarget;
    const bounds = node.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    node.style.transform = `rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 12).toFixed(2)}deg)`;
  }

  return (
    <Block id="tilt-cards">
      <div className="tilt-grid">
        {cards.map(([figure, label]) => (
          <article
            key={label}
            className="tilt-card"
            onPointerMove={move}
            onPointerLeave={(event) => {
              event.currentTarget.style.transform = "";
            }}
          >
            <p>{figure}</p>
            <h3>{label}</h3>
          </article>
        ))}
      </div>
    </Block>
  );
}

export function PathDraw() {
  return (
    <Block id="path-draw">
      <svg className="path-draw" viewBox="0 0 240 80" role="img" aria-label="Three inlet ramps">
        <path pathLength="1" d="M10 62 L70 18 L78 28 L28 66 Z" />
        <path pathLength="1" d="M86 62 L146 18 L154 28 L104 66 Z" />
        <path pathLength="1" d="M162 62 L222 18 L230 28 L180 66 Z" />
      </svg>
    </Block>
  );
}

export function BootLog() {
  const { motionOff } = usePerf();
  const active = useOn("boot-log");
  const [count, setCount] = useState(BOOT_LINES.length);
  const timer = useRef(0);

  useEffect(() => () => window.clearInterval(timer.current), []);

  function run() {
    window.clearInterval(timer.current);
    if (!active || motionOff) {
      setCount(BOOT_LINES.length);
      return;
    }
    setCount(1);
    timer.current = window.setInterval(() => {
      setCount((current) => {
        if (current >= BOOT_LINES.length) {
          window.clearInterval(timer.current);
          return current;
        }
        return current + 1;
      });
    }, 280);
  }

  return (
    <Block id="boot-log">
      <ol className="boot-log" aria-live="polite">
        {BOOT_LINES.slice(0, count).map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ol>
      <button type="button" onClick={run}>Replay boot</button>
    </Block>
  );
}

export function VelocitySkew() {
  const { motionOff } = usePerf();
  const active = useOn("velocity-skew");
  const ref = useRef(null);

  useEffect(() => {
    if (!active || motionOff) return undefined;
    let last = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      const speed = window.scrollY - last;
      last = window.scrollY;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (ref.current) ref.current.style.transform = `skewX(${Math.max(-12, Math.min(12, speed / 6))}deg)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [active, motionOff]);

  return (
    <Block id="velocity-skew">
      <p ref={ref} className="skew-line">Throw the page.</p>
    </Block>
  );
}

export function CellInvert() {
  return (
    <Block id="cell-invert">
      <div className="cells">
        {FACTS.map(([figure, label]) => (
          <button key={label} type="button">
            <strong>{figure}</strong>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </Block>
  );
}

export function FilmSprocket() {
  const { motionOff } = usePerf();
  const ref = useRef(null);
  const frames = ["Name", "Venue", "Fund", "Confirm"];

  function nudge(direction) {
    ref.current?.scrollBy({ left: direction * 240, behavior: motionOff ? "auto" : "smooth" });
  }

  return (
    <Block id="film-sprocket">
      <div className="film" ref={ref} data-lenis-prevent data-lenis-prevent-wheel tabIndex={0} aria-label="Launch film strip">
        {frames.map((frame, index) => (
          <article key={frame}>
            <span>0{index + 1}</span>
            <h3>{frame}</h3>
          </article>
        ))}
      </div>
      <div className="venue-controls">
        <button type="button" onClick={() => nudge(-1)}>Previous frame</button>
        <button type="button" onClick={() => nudge(1)}>Next frame</button>
      </div>
    </Block>
  );
}

export function ColorBurst() {
  const { motionOff } = usePerf();
  const ref = useRef(null);

  function burst() {
    const node = ref.current;
    if (!node) return;
    if (motionOff) {
      node.classList.toggle("is-hot");
      return;
    }
    for (let index = 0; index < 14; index += 1) {
      const dot = document.createElement("span");
      dot.className = "burst-dot";
      dot.style.setProperty("--dx", `${(Math.random() - 0.5) * 180}px`);
      dot.style.setProperty("--dy", `${(Math.random() - 0.5) * 120}px`);
      node.appendChild(dot);
      window.setTimeout(() => dot.remove(), 700);
    }
  }

  return (
    <Block id="color-burst">
      <div ref={ref} className="burst">
        <button type="button" onClick={burst}>Ignite</button>
      </div>
    </Block>
  );
}

export function UnderlineDraw() {
  const links = [
    ["Launch", "/launch"],
    ["Workspace", "/workspace"],
    ["Marketplace", "/marketplace"],
    ["Docs", "/docs"],
  ];
  return (
    <Block id="underline-draw">
      <ul className="draw-links">
        {links.map(([label, href]) => (
          <li key={href}>
            <a href={href} onClick={(event) => event.preventDefault()}>{label}</a>
          </li>
        ))}
      </ul>
      <p className="hint">These links stay on the prototype. They show the underline, and they do not open the production app.</p>
    </Block>
  );
}

export function CountRunway() {
  const { motionOff } = usePerf();
  const active = useOn("count-runway");
  const root = useRef(null);
  const [values, setValues] = useState(motionOff ? RUNWAY : [0, 0, 0]);

  useEffect(() => {
    if (!active) return undefined;
    if (motionOff) {
      setValues(RUNWAY);
      return undefined;
    }
    const node = root.current;
    if (!node) return undefined;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / 900);
        setValues(RUNWAY.map((target) => target * t));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      observer.disconnect();
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [active, motionOff]);

  const labels = ["venues", "protocol fee", "comparison"];
  return (
    <Block id="count-runway">
      <div ref={root} className="runway">
        {values.map((value, index) => (
          <p key={labels[index]}>
            <strong>{index === 0 ? Math.round(value) : value.toFixed(1)}</strong>
            <span>{labels[index]}</span>
          </p>
        ))}
      </div>
    </Block>
  );
}

export function ClipMask() {
  const [open, setOpen] = useState(true);
  return (
    <Block id="clip-mask">
      <button type="button" aria-pressed={open} onClick={() => setOpen((value) => !value)}>
        {open ? "Close the mask" : "Open the fee"}
      </button>
      <p className={open ? "mask is-open" : "mask"}>3.5%</p>
    </Block>
  );
}

export function ScrollGrain() {
  const { motionOff } = usePerf();
  const active = useOn("scroll-grain");
  const ref = useRef(null);

  useEffect(() => {
    if (!active || motionOff) return undefined;
    let last = window.scrollY;
    const onScroll = () => {
      const speed = Math.abs(window.scrollY - last);
      last = window.scrollY;
      if (ref.current) ref.current.style.opacity = String(Math.min(0.65, speed / 70));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [active, motionOff]);

  return (
    <Block id="scroll-grain">
      <div className="grain-plate">
        <p>Grain shows up only while the page is moving.</p>
        <div ref={ref} className="grain" aria-hidden="true" />
      </div>
    </Block>
  );
}

export function CommandHint() {
  const [step, setStep] = useState(0);
  const beats = ["Name it", "Pick a venue", "Fund the wallet", "Confirm"];

  function onKeyDown(event) {
    const index = Number(event.key) - 1;
    if (index >= 0 && index < beats.length) setStep(index);
  }

  return (
    <Block id="command-hint">
      <div className="command" role="group" aria-label="Launch beats" tabIndex={0} onKeyDown={onKeyDown}>
        <p>Focus this panel and press 1 through 4.</p>
        <div className="cells">
          {beats.map((beat, index) => (
            <button key={beat} type="button" aria-pressed={step === index} onClick={() => setStep(index)}>
              <strong>{index + 1}</strong>
              <span>{beat}</span>
            </button>
          ))}
        </div>
      </div>
    </Block>
  );
}

export function ScrollEqualizer() {
  const { motionOff } = usePerf();
  const active = useOn("scroll-eq");
  const ref = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const paint = () => {
      const node = ref.current;
      if (!node) return;
      const bounds = node.getBoundingClientRect();
      const view = window.innerHeight || 1;
      const progress = Math.min(1, Math.max(0, (view - bounds.top) / (view + bounds.height)));
      node.querySelectorAll("span").forEach((bar, index) => {
        const wave = motionOff ? progress : Math.min(1, Math.max(0.08, progress * (0.45 + (index % 5) * 0.14)));
        bar.style.transform = `scaleY(${wave})`;
      });
    };
    paint();
    window.addEventListener("scroll", paint, { passive: true });
    return () => window.removeEventListener("scroll", paint);
  }, [active, motionOff]);

  return (
    <Block id="scroll-eq">
      <div ref={ref} className="eq" aria-hidden="true">
        {Array.from({ length: 16 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <p className="sr-only">A row of bars that grows as this section moves through the viewport.</p>
    </Block>
  );
}

export function FooterLift() {
  const [open, setOpen] = useState(false);
  return (
    <Block id="footer-lift">
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        {open ? "Lower the plate" : "Lift the close"}
      </button>
      <div className={open ? "lift is-up" : "lift"}>
        <p>SCRAMJET · 3.5% · confirm and return to the terminal.</p>
      </div>
    </Block>
  );
}

export function IgnitionCount() {
  const { motionOff } = usePerf();
  const active = useOn("ignition-count");
  const [value, setValue] = useState(100);
  const timer = useRef(0);

  useEffect(() => () => window.clearInterval(timer.current), []);

  function run() {
    window.clearInterval(timer.current);
    if (!active || motionOff) {
      setValue(100);
      return;
    }
    let next = 0;
    setValue(0);
    timer.current = window.setInterval(() => {
      next += 2;
      setValue(Math.min(100, next));
      if (next >= 100) window.clearInterval(timer.current);
    }, 16);
  }

  return (
    <Block id="ignition-count">
      <p className="fee-figure" aria-live="polite">{String(value).padStart(3, "0")}</p>
      <button type="button" onClick={run}>Replay count</button>
    </Block>
  );
}

export function SnapChapters() {
  const { motionOff } = usePerf();
  const ref = useRef(null);
  const chapters = [
    ["01", "Name", "Ticker, supply, one sentence."],
    ["02", "Venue", "Turn the mark. Deploy there."],
    ["03", "Fund", "The wallet is funded first."],
    ["04", "Confirm", "Solana finalizes it."],
  ];

  function nudge(direction) {
    const card = ref.current?.querySelector("article");
    const width = card ? card.getBoundingClientRect().width + 12 : 280;
    ref.current?.scrollBy({ left: direction * width, behavior: motionOff ? "auto" : "smooth" });
  }

  return (
    <Block id="snap-chapters">
      <div ref={ref} className="snap" data-lenis-prevent data-lenis-prevent-wheel tabIndex={0} aria-label="Launch chapters">
        {chapters.map(([k, title, copy]) => (
          <article key={k}>
            <span>{k}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
      <div className="venue-controls">
        <button type="button" onClick={() => nudge(-1)}>Previous chapter</button>
        <button type="button" onClick={() => nudge(1)}>Next chapter</button>
      </div>
    </Block>
  );
}

export function CursorTrail() {
  const { motionOff } = usePerf();
  const dots = useRef([]);

  function move(event) {
    if (motionOff || window.matchMedia("(pointer: coarse)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    for (let index = dots.current.length - 1; index > 0; index -= 1) {
      const prev = dots.current[index - 1];
      const node = dots.current[index];
      if (prev && node) node.style.transform = prev.style.transform;
    }
    if (dots.current[0]) dots.current[0].style.transform = `translate(${x}px, ${y}px)`;
  }

  return (
    <Block id="cursor-trail">
      <div className="trail" onPointerMove={move}>
        <p>The system cursor stays. The trail is paint.</p>
        {Array.from({ length: 8 }, (_, index) => (
          <span
            key={index}
            ref={(node) => {
              dots.current[index] = node;
            }}
            aria-hidden="true"
            style={{ opacity: 1 - index * 0.1 }}
          />
        ))}
      </div>
    </Block>
  );
}

export function MorphTabs() {
  const [index, setIndex] = useState(0);
  return (
    <Block id="morph-tabs">
      <div className="tabs" role="tablist" aria-label="Launch facts">
        {TABS.map((tab, tabIndex) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={index === tabIndex}
            onClick={() => setIndex(tabIndex)}
          >
            {tab.label}
          </button>
        ))}
        <span className="tab-indicator" style={{ transform: `translateX(${index * 100}%)` }} aria-hidden="true" />
      </div>
      <p role="tabpanel">{TABS[index].copy}</p>
    </Block>
  );
}

export function NameLoop() {
  return (
    <Block id="name-loop">
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track name-track">
          {Array.from({ length: 2 }, (_, copy) => (
            <p key={copy}>SCRAMJET · 3.5% · SCRAMJET · 3.5% ·</p>
          ))}
        </div>
      </div>
    </Block>
  );
}

export function TrackedHeadline() {
  const { motionOff } = usePerf();
  const active = useOn("tracked-headline");
  const ref = useRef(null);

  useEffect(() => {
    if (!active || motionOff) return undefined;
    const paint = () => {
      const node = ref.current;
      if (!node) return;
      const bounds = node.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, 1 - bounds.top / (window.innerHeight || 1)));
      node.style.letterSpacing = `${(0.55 - progress * 0.42).toFixed(3)}em`;
    };
    paint();
    window.addEventListener("scroll", paint, { passive: true });
    return () => window.removeEventListener("scroll", paint);
  }, [active, motionOff]);

  return (
    <Block id="tracked-headline">
      <p ref={ref} className="tracked">DEPLOY</p>
    </Block>
  );
}

export function GlitchLockup() {
  const { motionOff } = usePerf();
  const [armed, setArmed] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function arm() {
    if (motionOff) return;
    setArmed(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setArmed(false), 420);
  }

  return (
    <Block id="glitch-lockup">
      <p className={armed ? "glitch is-on" : "glitch"}>SCRAMJET</p>
      <button type="button" onClick={arm}>Arm a glitch</button>
    </Block>
  );
}

export function SpecAccordion() {
  const rows = [
    ["Venue", "Pick a mark. The same flow deploys there."],
    ["Fee", "3.5% protocol fee. The comparison shown on the live site is 5.0%."],
    ["Wallet", "Fund the launch wallet before the transaction is sent."],
  ];
  return (
    <Block id="spec-accordion">
      <div className="specs">
        {rows.map(([title, copy]) => (
          <details key={title}>
            <summary>{title}</summary>
            <p>{copy}</p>
          </details>
        ))}
      </div>
    </Block>
  );
}

export function SplitFee() {
  return (
    <Block id="split-fee">
      <div className="split" tabIndex={0}>
        <p>3.5%</p>
        <p>5.0%</p>
      </div>
      <p className="hint">Hover or focus the pair.</p>
    </Block>
  );
}

export function LocalClock() {
  const [now, setNow] = useState(() => new Date());
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const shown = new Date(now.getTime() + offset * 60000);
  const stamp = shown.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <Block id="local-clock">
      <p className="fee-figure clock-figure" aria-live="off">{stamp}</p>
      <label className="range-label">
        Time travel, in minutes
        <input
          type="range"
          min="-720"
          max="720"
          value={offset}
          onChange={(event) => setOffset(Number(event.target.value))}
        />
      </label>
      <button type="button" onClick={() => setOffset(0)}>Reset to local time</button>
    </Block>
  );
}

export function Constellation() {
  const { motionOff } = usePerf();
  const ref = useRef(null);
  const points = useRef(
    Array.from({ length: 28 }, (_, index) => ({
      x: 8 + ((index * 37) % 84),
      y: 14 + ((index * 53) % 72),
    })),
  );

  function move(event) {
    if (motionOff) return;
    const node = ref.current;
    if (!node) return;
    const bounds = node.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    node.querySelectorAll("circle").forEach((dot, index) => {
      const point = points.current[index];
      const dx = point.x - x;
      const dy = point.y - y;
      const distance = Math.hypot(dx, dy) || 0.001;
      const push = distance < 16 ? (16 - distance) * 0.45 : 0;
      dot.setAttribute("cx", String(point.x + (dx / distance) * push));
      dot.setAttribute("cy", String(point.y + (dy / distance) * push));
    });
  }

  return (
    <Block id="constellation">
      <svg
        ref={ref}
        className="stars"
        viewBox="0 0 100 100"
        onPointerMove={move}
        aria-hidden="true"
      >
        {points.current.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r={index % 4 === 0 ? 1.3 : 0.7} />
        ))}
      </svg>
      <p className="sr-only">A field of points that moves away from a fine pointer.</p>
    </Block>
  );
}

export const CATALOG = {
  "velocity-marquee": VelocityMarquee,
  "decode-headline": DecodeHeadline,
  "sticky-stack": StickyStack,
  "compare-scrub": CompareScrub,
  "spotlight": Spotlight,
  "tilt-cards": TiltCards,
  "path-draw": PathDraw,
  "boot-log": BootLog,
  "velocity-skew": VelocitySkew,
  "cell-invert": CellInvert,
  "film-sprocket": FilmSprocket,
  "color-burst": ColorBurst,
  "underline-draw": UnderlineDraw,
  "count-runway": CountRunway,
  "clip-mask": ClipMask,
  "scroll-grain": ScrollGrain,
  "command-hint": CommandHint,
  "scroll-eq": ScrollEqualizer,
  "footer-lift": FooterLift,
  "ignition-count": IgnitionCount,
  "snap-chapters": SnapChapters,
  "cursor-trail": CursorTrail,
  "morph-tabs": MorphTabs,
  "name-loop": NameLoop,
  "tracked-headline": TrackedHeadline,
  "glitch-lockup": GlitchLockup,
  "spec-accordion": SpecAccordion,
  "split-fee": SplitFee,
  "local-clock": LocalClock,
  constellation: Constellation,
};
