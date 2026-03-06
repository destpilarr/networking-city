"use client";

import { useState, useCallback, useRef } from "react";
import { useColyseus } from "./hooks/use-colyseus";
import { GameCanvas } from "./game-canvas";
import { ChatOverlay } from "./ui/chat-overlay";
import { Hud } from "./ui/hud";

interface RoomConnectorProps {
  roomId: string;
}

interface ChatMessage {
  playerId: string;
  message: string;
  timestamp: number;
}

export function RoomConnector({ roomId }: RoomConnectorProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatFocused, setChatFocused] = useState(false);
  const localPosRef = useRef({ x: 0, z: 0 });

  const handleChat = useCallback((msg: { playerId: string; message: string }) => {
    setChatMessages((prev) => [
      ...prev.slice(-99),
      { ...msg, timestamp: Date.now() },
    ]);
  }, []);

  const { players, localSessionId, status, error, sendMove, sendChat } =
    useColyseus(roomId, handleChat);

  const handlePositionChange = useCallback(
    (x: number, z: number) => {
      localPosRef.current = { x, z };
      sendMove(x, z);
    },
    [sendMove],
  );

  if (status === "connecting") {
    return (
      <div className="flex h-[600px] items-center justify-center rounded border border-slate-700">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          <p className="text-sm text-slate-300">Conectando à sala {roomId}...</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex h-[600px] items-center justify-center rounded border border-red-800/50 bg-red-950/20">
        <div className="flex flex-col items-center gap-2">
          <p className="font-medium text-red-400">Falha na conexão</p>
          {error && <p className="text-sm text-red-300">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded border border-slate-700">
      <GameCanvas
        players={players}
        localSessionId={localSessionId}
        onPositionChange={handlePositionChange}
        inputEnabled={!chatFocused}
      />
      <ChatOverlay
        messages={chatMessages}
        onSend={sendChat}
        onFocusChange={setChatFocused}
      />
      <Hud
        status={status}
        playerCount={players.size}
        localPosition={localPosRef.current}
      />
    </div>
  );
}
