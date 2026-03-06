export interface Position {
  x: number;
  y: number;
  z?: number;
}

export interface PlayerData {
  userId: string;
  displayName: string;
  position: Position;
  avatarSprite: string;
}

export interface ItemData {
  id: string;
  name: string;
  spriteKey: string;
  quantity: number;
}

export interface RoomJoinOptions {
  roomId?: string;
  mapId?: string;
  sessionToken: string;
}
