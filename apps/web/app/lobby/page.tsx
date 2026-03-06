import Link from "next/link";

const rooms = [
  { id: "hub-br-1", name: "Hub BR #1", occupancy: "0/150" },
  { id: "trade-br-1", name: "Trade BR #1", occupancy: "0/150" },
];

export default function LobbyPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Lobby MMO</h1>
        <p className="text-slate-300">
          Selecione uma sala persistente para entrar.
        </p>
      </header>

      <section className="grid gap-3">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="flex items-center justify-between rounded border border-slate-700 p-4"
          >
            <div>
              <p className="font-medium">{room.name}</p>
              <p className="text-sm text-slate-400">{room.occupancy}</p>
            </div>
            <Link
              className="rounded bg-slate-200 px-4 py-2 font-medium text-slate-900"
              href={`/room/${room.id}`}
            >
              Entrar
            </Link>
          </div>
        ))}
      </section>
    </main>
  );
}
