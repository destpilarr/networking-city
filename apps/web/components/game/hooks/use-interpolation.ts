"use client";

import { useRef, useCallback } from "react";
import { Vector3 } from "three";

interface Snapshot {
  x: number;
  y: number;
  z: number;
  time: number;
}

const INTERPOLATION_DELAY = 100; // ms behind server

export function useInterpolation() {
  const bufferRef = useRef<Snapshot[]>([]);
  const resultRef = useRef(new Vector3());

  const pushSnapshot = useCallback((x: number, y: number, z: number = 0) => {
    const buffer = bufferRef.current;
    buffer.push({ x, y, z, time: Date.now() });

    // Keep last 10 snapshots max
    if (buffer.length > 10) {
      buffer.shift();
    }
  }, []);

  const getInterpolatedPosition = useCallback((): Vector3 => {
    const buffer = bufferRef.current;
    const renderTime = Date.now() - INTERPOLATION_DELAY;

    if (buffer.length === 0) return resultRef.current;

    // Find two snapshots to interpolate between
    let from: Snapshot | null = null;
    let to: Snapshot | null = null;

    for (let i = 0; i < buffer.length - 1; i++) {
      if (buffer[i].time <= renderTime && buffer[i + 1].time >= renderTime) {
        from = buffer[i];
        to = buffer[i + 1];
        break;
      }
    }

    if (from && to) {
      const duration = to.time - from.time;
      const t = duration > 0 ? (renderTime - from.time) / duration : 0;
      const alpha = Math.min(Math.max(t, 0), 1);

      resultRef.current.set(
        from.x + (to.x - from.x) * alpha,
        from.y + (to.y - from.y) * alpha,
        from.z + (to.z - from.z) * alpha,
      );
    } else if (buffer.length > 0) {
      // Use the latest snapshot if no pair found
      const latest = buffer[buffer.length - 1];
      resultRef.current.set(latest.x, latest.y, latest.z);
    }

    // Prune old snapshots (keep at least 2)
    while (buffer.length > 2 && buffer[0].time < renderTime - 1000) {
      buffer.shift();
    }

    return resultRef.current;
  }, []);

  return { pushSnapshot, getInterpolatedPosition };
}
