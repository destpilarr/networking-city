import { defineRoom, defineServer } from "colyseus";
import { RedisDriver } from "@colyseus/redis-driver";
import { RedisPresence } from "@colyseus/redis-presence";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { LobbyRoom } from "./rooms/lobby-room";
import { WorldRoom } from "./rooms/world-room";

const colyseusPort = Number(process.env.COLYSEUS_PORT ?? 2567);
const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

const gameServer = defineServer({
  transport: new WebSocketTransport({
    pingInterval: 3_000,
    pingMaxRetries: 2,
    maxPayload: 65_536,
  }),
  presence: new RedisPresence(redisUrl),
  driver: new RedisDriver(redisUrl),
  rooms: {
    lobby: defineRoom(LobbyRoom).enableRealtimeListing(),
    world: defineRoom(WorldRoom).enableRealtimeListing(),
  },
});

gameServer.listen(colyseusPort);
