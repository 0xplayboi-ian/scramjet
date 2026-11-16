import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { SRGBColorSpace, TextureLoader } from "three";
import { VENUES } from "../data/venues.js";
import { usePerf } from "../perf/PerfProvider.jsx";

function material(color, extra = {}) {
  return <meshStandardMaterial color={color} metalness={0.28} roughness={0.38} {...extra} />;
}

function Body({ kind, color }) {
  if (kind === "pill") {
    return (
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.32, 0.86, 8, 24]} />
        {material("#3dce7a", { roughness: 0.42 })}
      </mesh>
    );
  }

  if (kind === "slash") {
    return (
      <group rotation={[0, 0, -0.45]}>
        {["#ff5a1f", "#ff2d55", "#ff8a00", "#c0124a"].map((swatch, index) => (
          <mesh key={swatch} position={[0, (index - 1.5) * 0.22, index * 0.02]}>
            <boxGeometry args={[1.15, 0.14, 0.22]} />
            {material(swatch, { emissive: swatch, emissiveIntensity: 0.18 })}
          </mesh>
        ))}
      </group>
    );
  }

  if (kind === "hex") {
    return (
      <group>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.62, 0.62, 0.28, 6]} />
          {material(color, { metalness: 0.55, roughness: 0.22, emissive: "#0a4d66", emissiveIntensity: 0.25 })}
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.08]}>
          <cylinderGeometry args={[0.38, 0.38, 0.1, 6]} />
          {material("#7ae7ff", { metalness: 0.4, roughness: 0.2 })}
        </mesh>
      </group>
    );
  }

  if (kind === "bag") {
    return (
      <group>
        <mesh position={[0, -0.08, 0]} scale={[0.95, 1.05, 0.72]}>
          <sphereGeometry args={[0.48, 28, 20]} />
          {material("#39e27a")}
        </mesh>
        <mesh position={[0, 0.46, 0]} rotation={[0.5, 0, 0]}>
          <torusGeometry args={[0.16, 0.045, 12, 24]} />
          {material("#178a45")}
        </mesh>
      </group>
    );
  }

  if (kind === "disc") {
    return (
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.62, 0.62, 0.16, 40]} />
        {material("#ff6a1a", { emissive: "#7a2800", emissiveIntensity: 0.2 })}
      </mesh>
    );
  }

  if (kind === "chevron") {
    return (
      <group>
        {[0, 0.42].map((shift) => (
          <group key={shift} position={[shift - 0.16, 0, 0]}>
            <mesh position={[0, 0.16, 0]} rotation={[0, 0, -0.62]}>
              <boxGeometry args={[0.62, 0.16, 0.16]} />
              {material(color)}
            </mesh>
            <mesh position={[0, -0.16, 0]} rotation={[0, 0, 0.62]}>
              <boxGeometry args={[0.62, 0.16, 0.16]} />
              {material(color)}
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  if (kind === "slab") {
    return (
      <mesh>
        <boxGeometry args={[1.55, 0.48, 0.26]} />
        {material("#6a4dff", { emissive: "#2a1870", emissiveIntensity: 0.35 })}
      </mesh>
    );
  }

  return (
    <group>
      <mesh>
        <boxGeometry args={[0.78, 0.98, 0.16]} />
        {material("#111418")}
      </mesh>
      {[
        [0, 0.34, 0.18, 0.58, 0.14, 0.08],
        [-0.22, 0.16, 0.18, 0.14, 0.28, 0.08],
        [0, 0, 0.18, 0.5, 0.14, 0.08],
        [0.22, -0.16, 0.18, 0.14, 0.28, 0.08],
        [0, -0.34, 0.18, 0.58, 0.14, 0.08],
      ].map((args) => (
        <mesh key={args.join("-")} position={[args[0], args[1], args[2]]}>
          <boxGeometry args={[args[3], args[4], args[5]]} />
          {material("#f4f7fb")}
        </mesh>
      ))}
    </group>
  );
}

function slot(index, focus) {
  const count = VENUES.length;
  let offset = index - focus;
  if (offset > count / 2) offset -= count;
  if (offset < -count / 2) offset += count;
  return {
    x: offset * 1.7,
    z: -Math.abs(offset) * 0.55,
    scale: offset === 0 ? 1.15 : 0.4,
    focused: offset === 0,
  };
}

function Mark({ venue, texture, index, focus, low }) {
  const ref = useRef(null);
  const place = slot(index, focus);
  useFrame((_, delta) => {
    const node = ref.current;
    if (!node) return;
    const next = slot(index, focus);
    node.position.x += (next.x - node.position.x) * 0.14;
    node.position.z += (next.z - node.position.z) * 0.14;
    const scale = node.scale.x + (next.scale - node.scale.x) * 0.14;
    node.scale.setScalar(scale);
    if (!low) node.rotation.y += delta * (next.focused ? 0.65 : 0.12);
  });

  const badge = venue.kind === "pill" ? [1.15, 0.64] : venue.kind === "slab" ? [1.25, 0.42] : [0.86, 0.86];
  const badgeZ = venue.kind === "hex" || venue.kind === "disc" ? 0.22 : 0.42;

  return (
    <group ref={ref} position={[place.x, 0, place.z]} scale={place.scale}>
      <Body kind={venue.kind} color={venue.color} />
      {texture ? (
        <mesh position={[0, 0, badgeZ]}>
          <planeGeometry args={badge} />
          <meshBasicMaterial map={texture} transparent toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
}

function Rig({ focus, textures }) {
  const { low } = usePerf();
  useFrame((state) => {
    if (low) state.invalidate();
  });

  return (
    <group>
      {VENUES.map((venue, index) => (
        <Mark key={venue.id} venue={venue} texture={textures[index]} index={index} focus={focus} low={low} />
      ))}
    </group>
  );
}

export default function VenueScene({ onReady, focus = 0 }) {
  const { low } = usePerf();
  const [textures, setTextures] = useState([]);
  const held = useRef([]);

  useEffect(() => {
    const loader = new TextureLoader();
    let alive = true;
    Promise.all(
      VENUES.map(
        (venue) =>
          new Promise((resolve) => {
            loader.load(
              venue.src,
              (texture) => {
                texture.colorSpace = SRGBColorSpace;
                texture.anisotropy = 4;
                resolve(texture);
              },
              undefined,
              () => resolve(null),
            );
          }),
      ),
    ).then((maps) => {
      if (!alive) {
        maps.forEach((texture) => texture?.dispose());
        return;
      }
      held.current = maps;
      setTextures(maps);
    });
    return () => {
      alive = false;
      held.current.forEach((texture) => texture?.dispose());
    };
  }, []);

  return (
    <Canvas
      dpr={low ? 1 : [1, 1.5]}
      frameloop={low ? "demand" : "always"}
      gl={{ antialias: !low, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.45, 4.5], fov: 38 }}
      onCreated={({ gl, invalidate }) => {
        gl.setClearColor("#0D1117", 1);
        onReady?.();
        invalidate();
      }}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 4, 2]} intensity={2.2} />
      <directionalLight position={[-3, 1, -2]} intensity={0.6} color="#8fd0f2" />
      <Rig focus={focus} textures={textures} />
    </Canvas>
  );
}
