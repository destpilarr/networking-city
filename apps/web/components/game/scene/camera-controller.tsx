"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import { Vector3, OrthographicCamera as OrthographicCameraType } from "three";

interface CameraControllerProps {
  target: Vector3 | null;
  zoom?: number;
}

const ISO_DISTANCE = 50;
const CAM_OFFSET = new Vector3(ISO_DISTANCE, ISO_DISTANCE, ISO_DISTANCE);
const LERP_FACTOR = 0.08;

export function CameraController({ target, zoom = 120 }: CameraControllerProps) {
  const camRef = useRef<OrthographicCameraType>(null);
  const currentPos = useRef(new Vector3(ISO_DISTANCE, ISO_DISTANCE, ISO_DISTANCE));

  useFrame(() => {
    if (!camRef.current || !target) return;

    // Target camera position = player position + isometric offset
    const desiredX = target.x + CAM_OFFSET.x;
    const desiredY = target.y + CAM_OFFSET.y;
    const desiredZ = target.z + CAM_OFFSET.z;

    // Smooth follow via lerp
    currentPos.current.x += (desiredX - currentPos.current.x) * LERP_FACTOR;
    currentPos.current.y += (desiredY - currentPos.current.y) * LERP_FACTOR;
    currentPos.current.z += (desiredZ - currentPos.current.z) * LERP_FACTOR;

    camRef.current.position.copy(currentPos.current);
    camRef.current.lookAt(target.x, target.y, target.z);
  });

  return (
    <OrthographicCamera
      ref={camRef}
      makeDefault
      zoom={zoom}
      position={[ISO_DISTANCE, ISO_DISTANCE, ISO_DISTANCE]}
      near={0.1}
      far={500}
    />
  );
}
