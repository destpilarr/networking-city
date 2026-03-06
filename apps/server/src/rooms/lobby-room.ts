import { Client, Room } from "colyseus";

export class LobbyRoom extends Room {
  maxClients = 500;
  autoDispose = false;

  onCreate() {
    this.setMetadata({
      type: "lobby",
    });
  }

  onJoin(_client: Client) {
    return;
  }
}
