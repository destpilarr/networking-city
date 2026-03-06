"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, CapsuleCollider } from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import { Vector3, Group } from "three";
import { PlayerModel } from "./player-model";
import { useGameInput } from "../hooks/use-game-input";

interface LocalPlayerProps {
  onPositionChange: (x: number, z: number) => void;
  positionRef: React.MutableRefObject<Vector3>;
  inputEnabled?: boolean;
}

const MOVE_SPEED = 5;
const SEND_INTERVAL = 1000 / 12; // ~12 Hz position updates

export function LocalPlayer({
  onPositionChange,
  positionRef,
  inputEnabled = true,
}: LocalPlayerProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const groupRef = useRef<Group>(null);
  const lastSendTime = useRef(0);
  const isMoving = useRef(false);

  const { getMovement } = useGameInput(inputEnabled);

  const velocity = useRef(new Vector3());

  useFrame(() => {
    if (!rigidBodyRef.current) return;

    const movement = getMovement();
    const hasInput = movement.x !== 0 || movement.z !== 0;
    isMoving.current = hasInput;

    // Apply velocity
    velocity.current.set(
      movement.x * MOVE_SPEED,
      rigidBodyRef.current.linvel().y,
      movement.z * MOVE_SPEED,
    );
    rigidBodyRef.current.setLinvel(
      { x: velocity.current.x, y: velocity.current.y, z: velocity.current.z },
      true,
    );

    // Rotate to face movement direction
    if (hasInput && groupRef.current) {
      const angle = Math.atan2(movement.x, movement.z);
      groupRef.current.rotation.y = angle;
    }

    // Update position ref for camera tracking
    const pos = rigidBodyRef.current.translation();
    positionRef.current.set(pos.x, pos.y, pos.z);

    // Throttled network position send
    const now = Date.now();
    if (now - lastSendTime.current >= SEND_INTERVAL) {
      lastSendTime.current = now;
      onPositionChange(pos.x, pos.z);
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={[0, 1, 0]}
      enabledRotations={[false, false, false]}
      linearDamping={4}
      mass={1}
    >
      <CapsuleCollider args={[0.25, 0.25]} position={[0, 0.5, 0]} />
      <group ref={groupRef}>
        <PlayerModel animation={isMoving.current ? "walk" : "idle"} color="#60a5fa" />
      </group>
    </RigidBody>
  );
}
