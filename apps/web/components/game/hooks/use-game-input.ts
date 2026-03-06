"use client";

import { useEffect, useRef, useCallback } from "react";

interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

interface MovementVector {
  x: number;
  z: number;
}

const ZERO_VECTOR: MovementVector = { x: 0, z: 0 };

export function useGameInput(enabled: boolean = true) {
  const inputRef = useRef<InputState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          inputRef.current.forward = true;
          break;
        case "KeyS":
        case "ArrowDown":
          inputRef.current.backward = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          inputRef.current.left = true;
          break;
        case "KeyD":
        case "ArrowRight":
          inputRef.current.right = true;
          break;
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          inputRef.current.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          inputRef.current.backward = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          inputRef.current.left = false;
          break;
        case "KeyD":
        case "ArrowRight":
          inputRef.current.right = false;
          break;
      }
    }

    function handleBlur() {
      inputRef.current.forward = false;
      inputRef.current.backward = false;
      inputRef.current.left = false;
      inputRef.current.right = false;
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [enabled]);

  const getMovement = useCallback((): MovementVector => {
    const { forward, backward, left, right } = inputRef.current;

    if (!forward && !backward && !left && !right) return ZERO_VECTOR;

    let x = 0;
    let z = 0;

    if (forward) z -= 1;
    if (backward) z += 1;
    if (left) x -= 1;
    if (right) x += 1;

    // Normalize diagonal movement
    const length = Math.sqrt(x * x + z * z);
    if (length > 0) {
      x /= length;
      z /= length;
    }

    return { x, z };
  }, []);

  return { getMovement, inputRef };
}
