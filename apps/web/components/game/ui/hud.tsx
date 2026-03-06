"use client";

import type { ConnectionStatus } from "../hooks/use-colyseus";

interface HudProps {
  status: ConnectionStatus;
  playerCount: number;
  localPosition?: { x: number; z: number };
}

export function Hud({ status, playerCount, localPosition }: HudProps) {
  const statusColor =
    status === "connected"
      ? "text-emerald-400"
      : status === "connecting"
        ? "text-yellow-400"
        : "text-red-400";

  const statusLabel =
    status === "connected"
      ? "Conectado"
      : status === "connecting"
        ? "Conectando..."
        : "Desconectado";

  return (
    <div className="pointer-events-none absolute right-4 top-4 z-10 flex flex-col items-end gap-1">
      <div className="rounded bg-black/50 px-3 py-1.5 backdrop-blur-sm">
        <span className={`text-xs font-medium ${statusColor}`}>
          ● {statusLabel}
        </span>
      </div>
      <div className="rounded bg-black/50 px-3 py-1 backdrop-blur-sm">
        <span className="text-xs text-slate-300">
          Jogadores: {playerCount}
        </span>
      </div>
      {localPosition && (
        <div className="rounded bg-black/50 px-3 py-1 backdrop-blur-sm">
          <span className="text-xs font-mono text-slate-400">
            {localPosition.x.toFixed(1)}, {localPosition.z.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );
}
