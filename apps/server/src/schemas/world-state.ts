import { MapSchema, Schema, type } from "@colyseus/schema";

export class PlayerState extends Schema {
  @type("string")
  userId = "";

  @type("string")
  name = "";

  @type("number")
  x = 0;

  @type("number")
  y = 0;

  @type("string")
  avatarSprite = "default_avatar";
}

export class WorldState extends Schema {
  @type({ map: PlayerState })
  players = new MapSchema<PlayerState>();
}
