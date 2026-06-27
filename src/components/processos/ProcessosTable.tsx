"use client";
import Link from "next/link";
import { formatCNJ, formatDateTime, STATUS_LABELS, STATUS_COLORS, cn } from "@/lib/utils";
import type { ProcessoComRelacoes } from "@/types";

interface Props {
  processos: ProcessoComRelacoes[];
}

export function ProcessosTable({ processos }: Props) {
  if (processos.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <p className="text-slate-400 text-sm">Nenhum processo encontrado.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Tipo</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Nº Processo</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Reclamante</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Empresa</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Prazo</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Executor</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {processos.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", STATUS_COLORS[p.status])}>
                    {STATUS_LABELS[p.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate">
                  {p.tipoCalculo?.descricao ?? "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-700">
                  {formatCNJ(p.numeroCNJ)}
                </td>
                <td className="px-4 py-3 text-slate-700">{p.reclamante}</td>
                <td className="px-4 py-3 text-slate-600 max-w-[160px] truncate">
                  {p.empresa.razaoSocial}
                  {p.empresa.grupo && (
                    <span className="text-slate-400 text-xs ml-1">({p.empresa.grupo.nome})</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">
                  {formatDateTime(p.prazo)}
                </td>
                <td className="px-4 py-3 text-slate-600">{p.executor?.nome ?? "—"}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/processos/${p.id}`}
                    className="text-brand-navy text-xs font-medium hover:text-brand-gold transition"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
