import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-6 p-6">
      <LoginForm />
      <p className="text-sm text-slate-300">
        Sem conta? <Link href="/register" className="underline">Criar agora</Link>
      </p>
    </main>
  );
}
