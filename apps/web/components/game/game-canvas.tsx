"use client";

import { Suspense, useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { AdaptiveDpr, AdaptiveEvents, Bvh, Stats } from "@react-three/drei";
import { Vector3 } from "three";

import { CameraController } from "./scene/camera-controller";
import { Lighting } from "./scene/lighting";
import { Terrain } from "./scene/terrain";
import { LocalPlayer } from "./scene/local-player";
import { RemotePlayer } from "./scene/remote-player";
import type { ColyseusPlayer } from "./hooks/use-colyseus";

interface GameCanvasProps {
  players: Map<string, ColyseusPlayer>;
  localSessionId: string | null;
  onPositionChange: (x: number, z: number) => void;
  inputEnabled: boolean;
  debug?: boolean;
}

function LoadingFallback() {
  return (
    <mesh position={[0, 0.5, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#475569" wireframe />
    </mesh>
  );
}

export function GameCanvas({
  players,
  localSessionId,
  onPositionChange,
  inputEnabled,
  debug = false,
}: GameCanvasProps) {
  const localPositionRef = useRef(new Vector3(0, 1, 0));

  const remotePlayers = useMemo(() => {
    const entries: ColyseusPlayer[] = [];
    players.forEach((player) => {
      if (player.sessionId !== localSessionId) {
        entries.push(player);
      }
    });
    return entries;
  }, [players, localSessionId]);

  return (
    <Canvas
      shadows
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      }}
      style={{ width: "100%", height: "100%" }}
      frameloop="always"
    >
      <color attach="background" args={["#0f172a"]} />
      <fog attach="fog" args={["#0f172a", 30, 60]} />

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
      <Bvh>
        <Suspense fallback={<LoadingFallback />}>
          <CameraController target={localPositionRef.current} zoom={120} />
          <Lighting />

          <Physics gravity={[0, -9.81, 0]} timeStep="vary">
            <Terrain cols={16} rows={16} tileSize={1} />

            <LocalPlayer
              onPositionChange={onPositionChange}
              positionRef={localPositionRef}
              inputEnabled={inputEnabled}
            />

            {remotePlayers.map((player) => (
              <RemotePlayer
                key={player.sessionId}
                sessionId={player.sessionId}
                name={player.name}
                x={player.x}
                y={player.y}
              />
            ))}
          </Physics>
        </Suspense>
      </Bvh>

      {debug && <Stats />}
    </Canvas>
  );
}
