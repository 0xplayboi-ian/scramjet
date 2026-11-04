import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { usePerf } from "../perf/PerfProvider.jsx";

const COUNT = 16;

function Frames({ progressRef }) {
  const group = useRef(null);
  const { low } = usePerf();

  useFrame((state) => {
    const node = group.current;
    if (!node) return;
    const progress = progressRef?.current ?? 0;
    node.position.z = Math.sin(progress * Math.PI * 2) * 1.4;
    node.position.x = Math.sin(progress * Math.PI * 2) * 0.85;
    node.rotation.y = progress * Math.PI * 3.2;
    node.rotation.x = Math.sin(progress * Math.PI * 2) * 0.7;
    node.children.forEach((mesh, index) => {
      const wave = progress * Math.PI * 6 + index * 0.7;
      mesh.position.x = Math.sin(wave) * 1.25;
      mesh.position.y = Math.cos(wave * 0.8) * 0.55;
      mesh.rotation.z = Math.sin(wave) * 1.05;
      mesh.rotation.y = progress * Math.PI * 2 + index * 0.18;
    });
    state.camera.position.set(0, Math.sin(progress * Math.PI) * 0.35, 5.4);
    state.camera.lookAt(0, 0, -1.5);
    if (low) state.invalidate();
  });

  return (
    <group ref={group}>
      {Array.from({ length: COUNT }, (_, index) => (
        <mesh key={index} position={[0, 0, -index * 1.35]}>
          <boxGeometry args={[2.3 - (index % 5) * 0.08, 1.35, 0.045]} />
          <meshBasicMaterial
            color={index % 4 === 0 ? "#FF3E00" : index % 4 === 2 ? "#31E3AC" : "#8E9AA8"}
            wireframe
          />
        </mesh>
      ))}
    </group>
  );
}

export default function CascadeScene({ onReady, progressRef }) {
  const { low } = usePerf();
  return (
    <Canvas
      dpr={low ? 1 : [1, 1.35]}
      frameloop="always"
      gl={{ antialias: !low, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 5.4], fov: 52 }}
      onCreated={({ gl }) => {
        gl.setClearColor("#08090C", 1);
        onReady?.();
      }}
    >
      <Frames progressRef={progressRef} />
    </Canvas>
  );
}
