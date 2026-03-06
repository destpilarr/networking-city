"use client";

import { useMemo, useRef } from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { InstancedMesh, Object3D, Color } from "three";

interface TerrainProps {
  cols?: number;
  rows?: number;
  tileSize?: number;
}

// Tile types with low-poly colors
const TILE_COLORS: Record<string, string> = {
  grass: "#4ade80",
  grassDark: "#22c55e",
  dirt: "#a3763d",
  stone: "#94a3b8",
};

function getTileColor(col: number, row: number): string {
  // Simple pattern for visual variety
  if ((col + row) % 7 === 0) return TILE_COLORS.dirt;
  if ((col + row) % 11 === 0) return TILE_COLORS.stone;
  if ((col + row) % 2 === 0) return TILE_COLORS.grass;
  return TILE_COLORS.grassDark;
}

export function Terrain({ cols = 16, rows = 16, tileSize = 1 }: TerrainProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const totalTiles = cols * rows;

  const { matrices, colors } = useMemo(() => {
    const dummy = new Object3D();
    const mats: Float32Array = new Float32Array(totalTiles * 16);
    const cols_arr: Float32Array = new Float32Array(totalTiles * 3);
    const tempColor = new Color();

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col;

        // Position each tile, centered around origin
        dummy.position.set(
          (col - cols / 2) * tileSize + tileSize / 2,
          0,
          (row - rows / 2) * tileSize + tileSize / 2,
        );
        // Slight random height for low-poly feel
        dummy.position.y = Math.random() * 0.05;
        dummy.updateMatrix();
        dummy.matrix.toArray(mats, index * 16);

        // Per-instance color
        tempColor.set(getTileColor(col, row));
        cols_arr[index * 3] = tempColor.r;
        cols_arr[index * 3 + 1] = tempColor.g;
        cols_arr[index * 3 + 2] = tempColor.b;
      }
    }

    return { matrices: mats, colors: cols_arr };
  }, [cols, rows, tileSize, totalTiles]);

  // Apply matrices and colors to instanced mesh
  useMemo(() => {
    if (!meshRef.current) return;

    const dummy = new Object3D();
    for (let i = 0; i < totalTiles; i++) {
      dummy.matrix.fromArray(matrices, i * 16);
      dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
      meshRef.current.setMatrixAt(i, dummy.matrix);

      const color = new Color(
        colors[i * 3],
        colors[i * 3 + 1],
        colors[i * 3 + 2],
      );
      meshRef.current.setColorAt(i, color);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [matrices, colors, totalTiles]);

  const terrainWidth = cols * tileSize;
  const terrainDepth = rows * tileSize;

  return (
    <group>
      {/* Visual instanced tiles */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, totalTiles]}
        receiveShadow
      >
        <boxGeometry args={[tileSize * 0.98, 0.15, tileSize * 0.98]} />
        <meshStandardMaterial vertexColors roughness={0.8} flatShading />
      </instancedMesh>

      {/* Physics collider — single flat box covering entire terrain */}
      <RigidBody type="fixed" position={[0, -0.1, 0]}>
        <CuboidCollider args={[terrainWidth / 2, 0.1, terrainDepth / 2]} />
      </RigidBody>
    </group>
  );
}
