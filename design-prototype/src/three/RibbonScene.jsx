import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Vector2 } from "three";
import { usePerf } from "../perf/PerfProvider.jsx";

const vertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragment = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uLive;
  void main() {
    vec2 uv = vUv;
    float t = uTime * 2.8;
    float px = uPointer.x;
    float py = uPointer.y;
    float n1 = sin(uv.x * 8.0 + t + px * 4.0);
    float n2 = sin(uv.x * 15.0 - t * 1.7 + py * 3.0);
    float n3 = sin(uv.x * 4.2 + t * 0.9);
    float y1 = 0.68 + n1 * 0.15 + n2 * 0.05 + (py - 0.5) * 0.32;
    float y2 = 0.44 + n2 * 0.17 + (px - 0.5) * 0.26;
    float y3 = 0.22 + n3 * 0.13 + n1 * 0.04;
    float b1 = abs(uv.y - y1);
    float b2 = abs(uv.y - y2);
    float b3 = abs(uv.y - y3);
    float r1 = smoothstep(0.04, 0.0, b1);
    float r2 = smoothstep(0.028, 0.0, b2);
    float r3 = smoothstep(0.05, 0.0, b3);
    vec3 base = vec3(0.031, 0.035, 0.047);
    vec3 plasma = vec3(1.0, 0.243, 0.0);
    vec3 flare = vec3(1.0, 0.467, 0.0);
    vec3 mint = vec3(0.192, 0.89, 0.675);
    vec3 color = base;
    color += flare * smoothstep(0.18, 0.0, b1) * 0.5 + plasma * r1;
    color += plasma * smoothstep(0.14, 0.0, b2) * 0.28 + flare * r2;
    color += mint * r3 + mint * smoothstep(0.16, 0.0, b3) * 0.18;
    float sparkX = fract(t * 0.28);
    float spark = smoothstep(0.03, 0.0, abs(uv.x - sparkX)) * smoothstep(0.07, 0.0, b1);
    color += vec3(1.0, 0.94, 0.82) * spark;
    float streak = smoothstep(0.45, 0.0, abs(fract(uv.x * 22.0 - t * 1.8) - 0.5));
    color += plasma * streak * r1 * 0.45;
    float grain = fract(sin(dot(uv, vec2(12.9, 78.2)) + t) * 43758.5);
    color += (grain - 0.5) * 0.045 * uLive;
    gl_FragColor = vec4(color, 1.0);
  }
`;

function Sheet() {
  const material = useRef(null);
  const { low } = usePerf();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new Vector2(0.5, 0.5) },
      uLive: { value: 1 },
    }),
    [],
  );

  useFrame((state, delta) => {
    const next = material.current?.uniforms;
    if (!next) return;
    if (!low) next.uTime.value += delta;
    next.uPointer.value.set(state.pointer.x * 0.5 + 0.5, state.pointer.y * 0.5 + 0.5);
    next.uLive.value = low ? 0 : 1;
    if (low) state.invalidate();
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={material} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} />
    </mesh>
  );
}

export default function RibbonScene({ onReady }) {
  const { low } = usePerf();
  return (
    <Canvas
      dpr={low ? 1 : [1, 1.25]}
      frameloop={low ? "demand" : "always"}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ invalidate }) => {
        onReady?.();
        invalidate();
      }}
    >
      <Sheet />
    </Canvas>
  );
}
