"use client";

import { memo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Vector3, MathUtils, Group } from "three";
import { PlayerModel } from "./player-model";
import { useInterpolation } from "../hooks/use-interpolation";

interface RemotePlayerProps {
  sessionId: string;
  name: string;
  x: number;
  y: number;
  color?: string;
}

const PLAYER_COLORS = [
  "#f472b6", "#a78bfa", "#34d399", "#fbbf24",
  "#f87171", "#38bdf8", "#fb923c", "#a3e635",
];

function getPlayerColor(sessionId: string): string {
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    hash = ((hash << 5) - hash + sessionId.charCodeAt(i)) | 0;
  }
  return PLAYER_COLORS[Math.abs(hash) % PLAYER_COLORS.length];
}

function RemotePlayerInner({ sessionId, name, x, y, color }: RemotePlayerProps) {
  const groupRef = useRef<Group>(null);
  const prevPos = useRef(new Vector3(x, 0, y));
  const isMoving = useRef(false);
  const { pushSnapshot, getInterpolatedPosition } = useInterpolation();

  const playerColor = color ?? getPlayerColor(sessionId);

  // Push new snapshot when server position changes
  useEffect(() => {
    pushSnapshot(x, 0, y);
  }, [x, y, pushSnapshot]);

  useFrame(() => {
    if (!groupRef.current) return;

    const interpolated = getInterpolatedPosition();

    // Detect movement for animation state
    const dx = interpolated.x - prevPos.current.x;
    const dz = interpolated.z - prevPos.current.z;
    const speed = Math.sqrt(dx * dx + dz * dz);
    isMoving.current = speed > 0.01;

    // Smooth position
    groupRef.current.position.x = MathUtils.lerp(
      groupRef.current.position.x,
      interpolated.x,
      0.15,
    );
    groupRef.current.position.z = MathUtils.lerp(
      groupRef.current.position.z,
      interpolated.z,
      0.15,
    );

    // Rotate to face movement direction
    if (isMoving.current) {
      const angle = Math.atan2(dx, dz);
      groupRef.current.rotation.y = MathUtils.lerp(
        groupRef.current.rotation.y,
        angle,
        0.1,
      );
    }

    prevPos.current.set(interpolated.x, interpolated.y, interpolated.z);
  });

  return (
    <group ref={groupRef} position={[x, 0, y]}>
      <PlayerModel
        animation={isMoving.current ? "walk" : "idle"}
        color={playerColor}
      />
      {/* Floating name tag */}
      <Html
        position={[0, 1.7, 0]}
        center
        distanceFactor={15}
        style={{ pointerEvents: "none" }}
      >
        <div className="whitespace-nowrap rounded bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
          {name}
        </div>
      </Html>
    </group>
  );
}

export const RemotePlayer = memo(RemotePlayerInner);
