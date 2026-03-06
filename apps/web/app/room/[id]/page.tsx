import { RoomConnector } from "@/components/game/room-connector";

interface RoomPageProps {
  params: Promise<{ id: string }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const resolvedParams = await params;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Room {resolvedParams.id}</h1>
      <RoomConnector roomId={resolvedParams.id} />
    </main>
  );
}
