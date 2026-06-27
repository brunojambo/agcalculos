"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const senha = (form.elements.namedItem("senha") as HTMLInputElement).value;

    const res = await signIn("credentials", { email, senha, redirect: false });
    if (res?.error) {
      setError("Email ou senha inválidos.");
      setLoading(false);
    } else {
      router.push("/dashboard/processos");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-8 space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input
          name="email" type="email" required autoComplete="email"
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
        <input
          name="senha" type="password" required
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit" disabled={loading}
        className="w-full bg-brand-navy text-white py-2.5 rounded-md text-sm font-semibold hover:bg-opacity-90 transition disabled:opacity-60"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
