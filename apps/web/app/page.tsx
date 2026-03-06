import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-semibold">Game Crypto MMO Infra</h1>
      <p className="text-slate-300">
        Infra inicial pronta para lobby MMO com Colyseus, Better Auth e
        PostgreSQL.
      </p>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="rounded bg-slate-200 px-4 py-2 font-medium text-slate-900"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded border border-slate-400 px-4 py-2 font-medium"
        >
          Criar conta
        </Link>
      </div>
    </main>
  );
}
