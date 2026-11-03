"use client";

import React, { useEffect, useRef } from "react";

export type AsciiStyle = "blocks" | "classic" | "hash" | "symbol" | "binary";

export type AsciiLogoOptions = {
  text: string;
  style: AsciiStyle;
  textColor: string;
  background: string;
  /** 0–100. Higher values sample a finer character grid. */
  detail: number;
  glow: boolean;
  texture: boolean;
};

const OUTPUT_SIZE = 512;

const STYLES: { id: AsciiStyle; label: string; mark: string }[] = [
  { id: "blocks", label: "Blocks", mark: "▓" },
  { id: "classic", label: "Classic", mark: "@#" },
  { id: "hash", label: "Hash", mark: "###" },
  { id: "symbol", label: "Symbol", mark: "ABC" },
  { id: "binary", label: "Binary", mark: "010" },
];

const PRESETS = [
  { id: "green", color: "#3DDC84" },
  { id: "white", color: "#F4F4F5" },
  { id: "gold", color: "#E2B340" },
  { id: "cyan", color: "#2EC8C0" },
  { id: "violet", color: "#8B6CFF" },
  { id: "red", color: "#E24B4B" },
];

const RAMPS: Record<AsciiStyle, string> = {
  blocks: " ░▒▓█",
  classic: " .:-=+*#%@",
  hash: " #",
  symbol: " .+*#%@$",
  binary: " 01",
};

function glyphFor(brightness: number, style: AsciiStyle): string {
  if (brightness < 28) return " ";
  const ramp = RAMPS[style];
  const t = Math.min(1, (brightness - 28) / 220);
  const index = Math.min(ramp.length - 1, Math.max(1, Math.round(t * (ramp.length - 1))));
  return ramp[index];
}

function hashSeed(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Paints a square PNG-ready logo: the text is drawn as solid letterforms,
 * sampled into a character grid, then redrawn in the chosen glyph set.
 * Returns false when the text has no visible characters.
 */
export function paintAsciiLogo(canvas: HTMLCanvasElement, options: AsciiLogoOptions): boolean {
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;

  const lines = options.text.replace(/\r/g, "").split("\n");
  const hasInk = lines.some((line) => line.trim().length > 0);

  ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  ctx.fillStyle = options.background;
  ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  if (options.texture) {
    const rand = mulberry32(hashSeed(`${options.text}|${options.background}|${options.detail}`));
    for (let i = 0; i < 1400; i++) {
      const x = Math.floor(rand() * OUTPUT_SIZE);
      const y = Math.floor(rand() * OUTPUT_SIZE);
      const light = rand() > 0.5;
      ctx.fillStyle = light ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.28)";
      ctx.fillRect(x, y, rand() > 0.8 ? 2 : 1, 1);
    }
  }

  if (!hasInk) return false;

  const mask = document.createElement("canvas");
  mask.width = OUTPUT_SIZE;
  mask.height = OUTPUT_SIZE;
  const maskCtx = mask.getContext("2d");
  if (!maskCtx) return false;
  maskCtx.fillStyle = "#000";
  maskCtx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  maskCtx.fillStyle = "#fff";
  maskCtx.textAlign = "center";
  maskCtx.textBaseline = "middle";

  const longest = lines.reduce((max, line) => (line.length > max.length ? line : max), "");
  let fontSize = Math.floor((OUTPUT_SIZE * 0.78) / Math.max(1, lines.length));
  const fontFamily = '"Noto Sans Display", "DejaVu Sans", sans-serif';
  const fit = () => {
    maskCtx.font = `900 ${fontSize}px ${fontFamily}`;
  };
  fit();
  while (fontSize > 18 && maskCtx.measureText(longest || "M").width > OUTPUT_SIZE * 0.9) {
    fontSize -= 2;
    fit();
  }
  const lineHeight = fontSize * 1.02;
  const blockHeight = lineHeight * lines.length;
  let baseline = (OUTPUT_SIZE - blockHeight) / 2 + lineHeight / 2;
  for (const line of lines) {
    maskCtx.fillText(line, OUTPUT_SIZE / 2, baseline);
    baseline += lineHeight;
  }

  const cols = Math.round(16 + (Math.min(100, Math.max(0, options.detail)) / 100) * 48);
  const cell = OUTPUT_SIZE / cols;
  const pixels = maskCtx.getImageData(0, 0, OUTPUT_SIZE, OUTPUT_SIZE).data;
  const glyphs: string[] = [];

  for (let y = 0; y < cols; y++) {
    for (let x = 0; x < cols; x++) {
      const x0 = Math.floor(x * cell);
      const y0 = Math.floor(y * cell);
      const x1 = Math.max(x0 + 1, Math.floor((x + 1) * cell));
      const y1 = Math.max(y0 + 1, Math.floor((y + 1) * cell));
      let sum = 0;
      let count = 0;
      for (let py = y0; py < y1; py += 2) {
        for (let px = x0; px < x1; px += 2) {
          sum += pixels[(py * OUTPUT_SIZE + px) * 4];
          count++;
        }
      }
      glyphs.push(glyphFor(sum / Math.max(1, count), options.style));
    }
  }

  const layer = document.createElement("canvas");
  layer.width = OUTPUT_SIZE;
  layer.height = OUTPUT_SIZE;
  const layerCtx = layer.getContext("2d");
  if (!layerCtx) return false;
  layerCtx.fillStyle = options.textColor;
  layerCtx.textAlign = "center";
  layerCtx.textBaseline = "middle";
  layerCtx.font = `${Math.max(8, Math.floor(cell * 1.15))}px "DejaVu Sans Mono", "JetBrains Mono", monospace`;

  glyphs.forEach((glyph, index) => {
    if (glyph === " ") return;
    const x = index % cols;
    const y = Math.floor(index / cols);
    layerCtx.fillText(glyph, x * cell + cell / 2, y * cell + cell / 2 + cell * 0.04);
  });

  if (options.glow) {
    ctx.save();
    ctx.filter = `blur(${Math.max(3, cell * 0.55)}px)`;
    ctx.globalAlpha = 0.9;
    ctx.drawImage(layer, 0, 0);
    ctx.restore();
  }
  ctx.drawImage(layer, 0, 0);
  return true;
}

type AsciiLogoModalProps = {
  open: boolean;
  initialText: string;
  text: string;
  style: AsciiStyle;
  textColor: string;
  background: string;
  detail: number;
  glow: boolean;
  texture: boolean;
  onText: (value: string) => void;
  onStyle: (value: AsciiStyle) => void;
  onTextColor: (value: string) => void;
  onBackground: (value: string) => void;
  onDetail: (value: number) => void;
  onGlow: (value: boolean) => void;
  onTexture: (value: boolean) => void;
  onCancel: () => void;
  onUse: (dataUrl: string) => void;
};

export function AsciiLogoModal({
  open,
  initialText,
  text,
  style,
  textColor,
  background,
  detail,
  glow,
  texture,
  onText,
  onStyle,
  onTextColor,
  onBackground,
  onDetail,
  onGlow,
  onTexture,
  onCancel,
  onUse,
}: AsciiLogoModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const seeded = useRef(false);

  useEffect(() => {
    if (!open) {
      seeded.current = false;
      return;
    }
    if (!seeded.current && text.trim().length === 0 && initialText.trim().length > 0) {
      seeded.current = true;
      onText(initialText.trim().slice(0, 32));
    }
  }, [open, initialText, text, onText]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    paintAsciiLogo(canvasRef.current, {
      text,
      style,
      textColor,
      background,
      detail,
      glow,
      texture,
    });
  }, [open, text, style, textColor, background, detail, glow, texture]);

  if (!open) return null;

  const canUse = text.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ascii-logo-title"
        className="w-full max-w-[420px] rounded-xl border border-[#222432] bg-[#121318] shadow-none"
      >
        <div className="flex items-start justify-between px-4 pt-4 pb-2">
          <div>
            <h2 id="ascii-logo-title" className="text-[15px] font-semibold text-[#F8FAFC]">
              ASCII token image
            </h2>
            <p className="text-[11px] text-[#8E9AA8] mt-0.5">
              Turn your symbol into ASCII art. Enter for a new line.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="h-7 w-7 rounded-md text-[#8E9AA8] hover:text-[#F8FAFC] hover:bg-[#1A1C25]"
          >
            ×
          </button>
        </div>

        <div className="px-4 pb-4 space-y-3">
          <div className="mx-auto h-[220px] w-[220px] rounded-lg border border-[#1A1C25] bg-[#07080C] overflow-hidden">
            <canvas
              ref={canvasRef}
              data-testid="ascii-preview"
              className="h-full w-full"
              width={OUTPUT_SIZE}
              height={OUTPUT_SIZE}
            />
          </div>

          <textarea
            value={text}
            aria-label="ASCII text"
            placeholder="Symbol"
            rows={2}
            onChange={(event) => onText(event.target.value.slice(0, 64))}
            className="w-full resize-none rounded-lg border border-[#2A2D3A] bg-[#0E0F14] px-3 py-2 text-xs text-[#F8FAFC] outline-none focus:border-[#31E3AC]"
          />

          <div className="space-y-1.5">
            <div className="text-[11px] text-[#8E9AA8]">Characters</div>
            <div className="grid grid-cols-5 gap-1.5">
              {STYLES.map((item) => {
                const selected = style === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onStyle(item.id)}
                    className={`h-12 rounded-lg border text-[10px] leading-tight ${
                      selected
                        ? "border-[#3B82F6] bg-[#121A2C] text-[#F8FAFC]"
                        : "border-[#2A2D3A] bg-[#0E0F14] text-[#8E9AA8] hover:border-[#3A3E50]"
                    }`}
                  >
                    <div className="font-mono text-[10px] text-[#C5CDD8]">{item.mark}</div>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] text-[#8E9AA8]">Colors</div>
            <div className="flex flex-wrap items-center gap-1.5">
              {PRESETS.map((preset) => {
                const selected = textColor.toLowerCase() === preset.color.toLowerCase();
                return (
                  <button
                    key={preset.id}
                    type="button"
                    aria-label={`${preset.id} text`}
                    onClick={() => onTextColor(preset.color)}
                    className={`h-7 w-7 rounded-md border text-[11px] font-bold ${
                      selected ? "border-[#F8FAFC]" : "border-[#2A2D3A]"
                    }`}
                    style={{ color: preset.color, background: "#0E0F14" }}
                  >
                    A
                  </button>
                );
              })}
              <label className="ml-1 flex items-center gap-1.5 text-[10px] text-[#8E9AA8]">
                <input
                  type="color"
                  aria-label="Text color"
                  value={textColor}
                  onChange={(event) => onTextColor(event.target.value)}
                  className="h-6 w-6 cursor-pointer rounded border border-[#2A2D3A] bg-transparent p-0"
                />
                Text
              </label>
              <label className="flex items-center gap-1.5 text-[10px] text-[#8E9AA8]">
                <input
                  type="color"
                  aria-label="Background color"
                  value={background}
                  onChange={(event) => onBackground(event.target.value)}
                  className="h-6 w-6 cursor-pointer rounded border border-[#2A2D3A] bg-transparent p-0"
                />
                Background
              </label>
            </div>
          </div>

          <label className="block space-y-1">
            <div className="flex justify-between text-[11px] text-[#8E9AA8]">
              <span>Detail</span>
              <span className="font-mono">{detail}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={detail}
              aria-label="Detail"
              onChange={(event) => onDetail(Number(event.target.value))}
              className="w-full accent-[#3B82F6]"
            />
          </label>

          <div className="flex items-center gap-5 text-[12px] text-[#C5CDD8]">
            <button
              type="button"
              onClick={() => onGlow(!glow)}
              className="flex items-center gap-2"
              aria-pressed={glow}
            >
              <span
                className={`relative h-5 w-9 rounded-full ${glow ? "bg-[#3B82F6]" : "bg-[#2A2D3A]"}`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white ${glow ? "left-4" : "left-0.5"}`}
                />
              </span>
              Glow
            </button>
            <button
              type="button"
              onClick={() => onTexture(!texture)}
              className="flex items-center gap-2"
              aria-pressed={texture}
            >
              <span
                className={`relative h-5 w-9 rounded-full ${texture ? "bg-[#3B82F6]" : "bg-[#2A2D3A]"}`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white ${texture ? "left-4" : "left-0.5"}`}
                />
              </span>
              Background texture
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="h-9 px-4 rounded-lg border border-[#2A2D3A] text-[12px] text-[#C5CDD8] hover:text-[#F8FAFC]"
            >
              Cancel
            </button>
            <button
              type="button"
              data-testid="ascii-use"
              disabled={!canUse}
              onClick={() => {
                const canvas = canvasRef.current;
                if (!canvas) return;
                const painted = paintAsciiLogo(canvas, {
                  text,
                  style,
                  textColor,
                  background,
                  detail,
                  glow,
                  texture,
                });
                if (!painted) return;
                onUse(canvas.toDataURL("image/png"));
              }}
              className="h-9 px-4 rounded-lg bg-[#3B82F6] text-[12px] font-semibold text-white disabled:opacity-40"
            >
              Use image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
