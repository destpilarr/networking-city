"use client";

import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const response = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (response.error) {
      setErrorMessage(response.error.message ?? "Falha no cadastro");
      return;
    }

    router.push("/lobby");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-sm flex-col gap-3 rounded border border-slate-700 p-4"
    >
      <h1 className="text-xl font-semibold">Criar conta</h1>
      <input
        className="rounded border border-slate-600 bg-slate-900 px-3 py-2"
        placeholder="Nome"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />
      <input
        className="rounded border border-slate-600 bg-slate-900 px-3 py-2"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <input
        className="rounded border border-slate-600 bg-slate-900 px-3 py-2"
        placeholder="Senha"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      {errorMessage ? (
        <p className="text-sm text-red-400">{errorMessage}</p>
      ) : null}
      <button
        className="rounded bg-slate-200 px-4 py-2 font-medium text-slate-900"
        type="submit"
      >
        Registrar
      </button>
    </form>
  );
}
