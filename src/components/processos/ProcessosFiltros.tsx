"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useRef } from "react";
import { Search } from "lucide-react";

const STATUS_OPTS = [
  { value: "", label: "Todos os status" },
  { value: "NOVO",               label: "Novo" },
  { value: "TRIAGEM",            label: "Triagem" },
  { value: "DIGITACAO",          label: "Digitação" },
  { value: "ELABORACAO",         label: "Elaboração" },
  { value: "REVISAO",            label: "Revisão" },
  { value: "QUALIDADE",          label: "Qualidade" },
  { value: "AGUARDANDO_CLIENTE", label: "Aguardando cliente" },
  { value: "FINALIZADO",         label: "Finalizado" },
  { value: "CANCELADO",          label: "Cancelado" },
];

interface Cliente { id: string; razaoSocial: string; nomeFantasia: string | null }
interface Props { clientes: Cliente[] }

export function ProcessosFiltros({ clientes }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = useCallback((key: string, value: string, debounce = false) => {
    const apply = () => {
      const params = new URLSearchParams(sp?.toString() ?? "");
      if (value) params.set(key, value); else params.delete(key);
      params.delete("page");
      startTransition(() => router.push(`/dashboard/processos?${params.toString()}`));
    };

    if (debounce) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(apply, 400);
    } else {
      apply();
    }
  }, [router, sp]);

  const temFiltro = !!(sp?.get("q") || sp?.get("status") || sp?.get("clienteId"));

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar CNJ ou reclamante..."
          defaultValue={sp?.get("q") ?? ""}
          onChange={(e) => update("q", e.target.value, true)}
          className="w-72 rounded-xl border border-gray-300 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <select
        defaultValue={sp?.get("status") ?? ""}
        onChange={(e) => update("status", e.target.value)}
        className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {STATUS_OPTS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <select
        defaultValue={sp?.get("clienteId") ?? ""}
        onChange={(e) => update("clienteId", e.target.value)}
        className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">Todos os clientes</option>
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>{c.nomeFantasia ?? c.razaoSocial}</option>
        ))}
      </select>

      {temFiltro && (
        <button
          onClick={() => router.push("/dashboard/processos")}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
