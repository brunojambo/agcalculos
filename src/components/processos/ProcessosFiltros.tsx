"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search } from "lucide-react";

const STATUS_OPTS = [
  { value: "", label: "Todos" },
  { value: "DISPONIVEL",  label: "Disponível" },
  { value: "TRIAGEM",     label: "Triagem" },
  { value: "DIGITACAO",   label: "Digitação" },
  { value: "REVISAO",     label: "Revisão" },
  { value: "APROVACAO",   label: "Aprovação" },
  { value: "CONCLUIDO",   label: "Concluído" },
  { value: "AGUARDANDO",  label: "Aguardando" },
];

export function ProcessosFiltros() {
  const router = useRouter();
  const sp     = useSearchParams();

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/dashboard/processos?${params.toString()}`);
  }, [router, sp]);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar CNJ ou reclamante..."
          defaultValue={sp.get("search") ?? ""}
          onChange={(e) => update("search", e.target.value)}
          className="pl-9 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy w-72"
        />
      </div>

      {/* Status */}
      <select
        defaultValue={sp.get("status") ?? ""}
        onChange={(e) => update("status", e.target.value)}
        className="border border-slate-200 rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-navy bg-white"
      >
        {STATUS_OPTS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
