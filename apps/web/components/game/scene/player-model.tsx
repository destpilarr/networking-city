"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, MathUtils } from "three";

interface PlayerModelProps {
  animation?: "idle" | "walk";
  color?: string;
}

/**
 * Low-poly capsule placeholder model.
 * Replace with GLTF model + useAnimations when assets are ready.
 */
export function PlayerModel({ animation = "idle", color = "#60a5fa" }: PlayerModelProps) {
  const bodyRef = useRef<Mesh>(null);
  const headRef = useRef<Mesh>(null);

  // Idle bob animation
  useFrame((_, delta) => {
    if (!bodyRef.current) return;

    if (animation === "idle") {
      bodyRef.current.position.y =
        0.5 + Math.sin(Date.now() * 0.003) * 0.03;
    } else {
      // Walk bounce
      bodyRef.current.position.y =
        0.5 + Math.abs(Math.sin(Date.now() * 0.01)) * 0.06;
    }

    // Head slight rotation while walking
    if (headRef.current && animation === "walk") {
      headRef.current.rotation.z = MathUtils.lerp(
        headRef.current.rotation.z,
        Math.sin(Date.now() * 0.008) * 0.1,
        delta * 5,
      );
    }
  });

  const materialProps = useMemo(() => ({
    color,
    roughness: 0.7,
    flatShading: true as const,
  }), [color]);

  return (
    <group>
      {/* Body — capsule approximation */}
      <mesh ref={bodyRef} position={[0, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.5, 4, 8]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.2, 8, 6]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Eyes */}
      <mesh position={[0.08, 1.2, 0.17]}>
        <sphereGeometry args={[0.04, 4, 4]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[-0.08, 1.2, 0.17]}>
        <sphereGeometry args={[0.04, 4, 4]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}
