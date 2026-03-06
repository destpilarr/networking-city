"use client";

import { Client } from "@colyseus/sdk";

const endpoint = process.env.NEXT_PUBLIC_COLYSEUS_URL ?? "ws://localhost:2567";

export const colyseusClient = new Client(endpoint);
