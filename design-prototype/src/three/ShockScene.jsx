import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { usePerf } from "../perf/PerfProvider.jsx";

function Field() {
  const points = useRef(null);
  const { low } = usePerf();
  const cols = low ? 12 : 26;
  const rows = low ? 7 : 14;
  const { base, colors } = useMemo(() => {
    const gap = 0.24;
    const next = new Float32Array(cols * rows * 3);
    const paint = new Float32Array(cols * rows * 3);
    let cursor = 0;
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const ox = (x - (cols - 1) / 2) * gap + (y % 2) * gap * 0.5;
        const oy = (y - (rows - 1) / 2) * gap * 0.66;
        next[cursor * 3] = ox;
        next[cursor * 3 + 1] = oy;
        next[cursor * 3 + 2] = 0;
        const mint = (x + y) % 2 === 0;
        paint[cursor * 3] = mint ? 0.192 : 1;
        paint[cursor * 3 + 1] = mint ? 0.89 : 0.243;
        paint[cursor * 3 + 2] = mint ? 0.675 : 0;
        cursor += 1;
      }
    }
    return { base: next, colors: paint };
  }, [cols, rows]);
  const seeded = useMemo(() => new Float32Array(base), [base]);
  const count = cols * rows;

  useFrame((state) => {
    const geometry = points.current?.geometry;
    if (!geometry) return;
    const positions = geometry.attributes.position;
    const time = low ? 0 : state.clock.elapsedTime;
    const pointerX = state.pointer.x * 2.15;
    const pointerY = state.pointer.y * 1.25;
    const wave = (time * 1.7) % 4.4;
    for (let index = 0; index < count; index += 1) {
      const ox = base[index * 3];
      const oy = base[index * 3 + 1];
      const dx = ox - pointerX;
      const dy = oy - pointerY;
      const dist = Math.hypot(dx, dy) || 0.001;
      const pointerMag = Math.hypot(state.pointer.x, state.pointer.y);
      const push = low || pointerMag < 0.05 ? 0 : Math.exp(-dist * dist * 1.7) * 0.72;
      const radial = Math.hypot(ox, oy);
      const ring = low ? 0 : Math.exp(-((radial - wave) ** 2) * 12);
      const nx = dx / dist;
      const ny = dy / dist;
      const rx = radial ? ox / radial : 0;
      const ry = radial ? oy / radial : 0;
      positions.setX(index, ox + nx * push + rx * ring * 0.16 + Math.sin(time * 2.4 + oy) * 0.02);
      positions.setY(index, oy + ny * push * 0.7 + ry * ring * 0.1 + Math.cos(time * 1.8 + ox) * 0.02);
      positions.setZ(index, ring * 0.22 + push * 0.18);
    }
    positions.needsUpdate = true;
    if (low) state.invalidate();
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[seeded, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial vertexColors size={low ? 0.055 : 0.04} sizeAttenuation />
    </points>
  );
}

export default function ShockScene({ onReady }) {
  const { low } = usePerf();
  return (
    <Canvas
      dpr={low ? 1 : [1, 1.25]}
      frameloop={low ? "demand" : "always"}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 3.15], fov: 48 }}
      onCreated={({ gl, invalidate }) => {
        gl.setClearColor("#08090C", 1);
        onReady?.();
        invalidate();
      }}
    >
      <Field />
    </Canvas>
  );
}
