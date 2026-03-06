"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Room } from "@colyseus/sdk";
import { colyseusClient } from "@/lib/colyseus";
import { messageTypes } from "@game-crypto/shared";
import { authClient } from "@/lib/auth-client";

export interface ColyseusPlayer {
  sessionId: string;
  userId: string;
  name: string;
  x: number;
  y: number;
  avatarSprite: string;
}

export type ConnectionStatus = "connecting" | "connected" | "failed";

interface UseColyseusReturn {
  room: Room | null;
  players: Map<string, ColyseusPlayer>;
  localSessionId: string | null;
  status: ConnectionStatus;
  error: string | null;
  sendMove: (x: number, y: number) => void;
  sendChat: (message: string) => void;
}

interface ChatMessage {
  playerId: string;
  message: string;
}

async function resolveSessionToken(): Promise<string> {
  if (typeof window === "undefined") return "";

  const cached = window.localStorage.getItem("mmo_session_token") ?? "";
  if (cached) return cached;

  const sessionResponse = await authClient.getSession();
  const tokenFromClient =
    (sessionResponse.data as { session?: { token?: string } } | null)?.session
      ?.token ?? "";

  if (tokenFromClient) {
    window.localStorage.setItem("mmo_session_token", tokenFromClient);
    return tokenFromClient;
  }

  try {
    const response = await fetch("/api/auth/get-session", {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) return "";

    const payload = (await response.json()) as {
      session?: { token?: string };
    };
    const tokenFromApi = payload.session?.token ?? "";
    if (tokenFromApi) {
      window.localStorage.setItem("mmo_session_token", tokenFromApi);
    }
    return tokenFromApi;
  } catch {
    return "";
  }
}

export function useColyseus(
  roomId: string,
  onChat?: (msg: ChatMessage) => void,
): UseColyseusReturn {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [localSessionId, setLocalSessionId] = useState<string | null>(null);
  const playersRef = useRef(new Map<string, ColyseusPlayer>());
  const [players, setPlayers] = useState(new Map<string, ColyseusPlayer>());
  const roomRef = useRef<Room | null>(null);
  const onChatRef = useRef(onChat);
  onChatRef.current = onChat;

  useEffect(() => {
    let cancelled = false;

    async function connect() {
      try {
        const sessionToken = await resolveSessionToken();
        const room = await colyseusClient.joinOrCreate("world", {
          roomId,
          sessionToken,
        });

        if (cancelled) {
          void room.leave();
          return;
        }

        roomRef.current = room;
        setLocalSessionId(room.sessionId);

        room.state.listen("players", () => {
          /* schema root change — handled by individual listeners */
        });

        room.state.players.onAdd((player: Record<string, unknown>, sessionId: string) => {
          const entry: ColyseusPlayer = {
            sessionId,
            userId: player.userId as string,
            name: player.name as string,
            x: player.x as number,
            y: player.y as number,
            avatarSprite: player.avatarSprite as string,
          };
          playersRef.current.set(sessionId, entry);
          setPlayers(new Map(playersRef.current));

          // Listen for position changes on this player
          (player as { listen: (prop: string, cb: (val: number) => void) => void }).listen("x", (val: number) => {
            const existing = playersRef.current.get(sessionId);
            if (existing) {
              existing.x = val;
              setPlayers(new Map(playersRef.current));
            }
          });
          (player as { listen: (prop: string, cb: (val: number) => void) => void }).listen("y", (val: number) => {
            const existing = playersRef.current.get(sessionId);
            if (existing) {
              existing.y = val;
              setPlayers(new Map(playersRef.current));
            }
          });
        });

        room.state.players.onRemove((_player: unknown, sessionId: string) => {
          playersRef.current.delete(sessionId);
          setPlayers(new Map(playersRef.current));
        });

        room.onMessage(
          messageTypes.playerChat,
          (data: ChatMessage) => {
            onChatRef.current?.(data);
          },
        );

        setStatus("connected");
      } catch (err) {
        if (!cancelled) {
          setStatus("failed");
          setError(
            err instanceof Error ? err.message : "Falha ao conectar na room",
          );
        }
      }
    }

    void connect();

    return () => {
      cancelled = true;
      if (roomRef.current) {
        void roomRef.current.leave();
        roomRef.current = null;
      }
    };
  }, [roomId]);

  const sendMove = useCallback((x: number, y: number) => {
    roomRef.current?.send(messageTypes.playerMove, { x, y });
  }, []);

  const sendChat = useCallback((message: string) => {
    roomRef.current?.send(messageTypes.playerChat, { message });
  }, []);

  return {
    room: roomRef.current,
    players,
    localSessionId,
    status,
    error,
    sendMove,
    sendChat,
  };
}
