import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const map = pgTable("map", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  tileData: jsonb("tile_data").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const room = pgTable("room", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  mapId: text("map_id")
    .notNull()
    .references(() => map.id, { onDelete: "restrict" }),
  maxPlayers: integer("max_players").notNull().default(50),
  isPublic: boolean("is_public").notNull().default(true),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const item = pgTable("item", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  spriteKey: text("sprite_key").notNull(),
  metadata: jsonb("metadata").notNull().default({}),
});

export const inventory = pgTable("inventory", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  itemId: text("item_id")
    .notNull()
    .references(() => item.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  equippedSlot: text("equipped_slot"),
});
