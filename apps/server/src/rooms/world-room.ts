import { Client, Room } from "colyseus";
import { messageTypes, Position } from "@game-crypto/shared";
import { PlayerState, WorldState } from "../schemas/world-state";
import { validateSessionToken } from "../utils/auth-session";

interface JoinOptions {
  roomId?: string;
  sessionToken?: string;
}

export class WorldRoom extends Room {
  state = new WorldState();
  maxClients = 150;
  patchRate = 50;
  autoDispose = false;
  maxMessagesPerSecond = 20;

  async onAuth(_client: Client, options: JoinOptions) {
    const token = options.sessionToken ?? "";
    const player = await validateSessionToken(token);

    if (!player) {
      throw new Error("unauthorized");
    }

    return player;
  }

  onCreate() {
    this.onMessage(messageTypes.playerMove, (client, payload: Position) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) {
        return;
      }

      player.x = payload.x;
      player.y = payload.y;
    });

    this.onMessage(
      messageTypes.playerChat,
      (client, payload: { message: string }) => {
        this.broadcast(messageTypes.playerChat, {
          playerId: client.sessionId,
          message: payload.message,
        });
      },
    );
  }

  onJoin(
    client: Client,
    _options: JoinOptions,
    auth: Awaited<ReturnType<typeof validateSessionToken>>,
  ) {
    const safeAuth = auth ?? {
      userId: `guest:${client.sessionId}`,
      name: "Guest",
      avatar: "default_avatar",
    };

    const player = new PlayerState();
    player.userId = safeAuth.userId;
    player.name = safeAuth.name || "Guest";
    player.avatarSprite = safeAuth.avatar || "default_avatar";
    player.x = 0;
    player.y = 0;

    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
  }
}
