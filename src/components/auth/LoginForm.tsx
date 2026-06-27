"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setCarregando(true);
    const formData = new FormData(event.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false
    });

    setCarregando(false);
    if (result?.error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
      <div>
        <h1 className="text-2xl font-bold">AG Cálculos</h1>
        <p className="mt-1 text-sm text-gray-500">Acesse o sistema operacional.</p>
      </div>
      <label className="block text-sm font-medium">
        E-mail
        <input name="email" type="email" defaultValue="admin@agcalculos.com.br" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" required />
      </label>
      <label className="block text-sm font-medium">
        Senha
        <input name="password" type="password" defaultValue="admin123" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" required />
      </label>
      {erro ? <p className="text-sm text-red-600">{erro}</p> : null}
      <button disabled={carregando} className="w-full rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white disabled:opacity-60">
        {carregando ? "Entrando..." : "Entrar"}
      </button>
      <p className="text-xs text-gray-500">Usuário inicial criado pelo seed. Troque a senha antes de usar em produção.</p>
    </form>
  );
}
