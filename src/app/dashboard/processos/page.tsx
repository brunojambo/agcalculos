import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { formatDate, statusClass, statusLabel } from "@/lib/utils/format";
import { formatCNJ } from "@/lib/utils/cnj";

export default async function ProcessosPage() {
  const processos = await prisma.processo.findMany({
    orderBy: [{ status: "asc" }, { prazoInterno: "asc" }, { createdAt: "desc" }],
    include: {
      cliente: true,
      tipoCalculo: true,
      executor: true
    }
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Processos</h1>
          <p className="text-sm text-gray-500">Fila principal de cálculos.</p>
        </div>
        <Link href="/dashboard/processos/novo" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">Novo processo</Link>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Processo</th>
              <th className="px-4 py-3">Reclamante</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Prazo</th>
              <th className="px-4 py-3">Executor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {processos.map((processo) => (
              <tr key={processo.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium"><Link href={`/dashboard/processos/${processo.id}`}>{formatCNJ(processo.numeroCnj)}</Link></td>
                <td className="px-4 py-3">{processo.reclamante}</td>
                <td className="px-4 py-3">{processo.cliente.nomeFantasia ?? processo.cliente.razaoSocial}</td>
                <td className="px-4 py-3">{processo.tipoCalculo.nome}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(processo.status)}`}>{statusLabel(processo.status)}</span></td>
                <td className="px-4 py-3">{formatDate(processo.prazoInterno)}</td>
                <td className="px-4 py-3">{processo.executor?.nome ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {processos.length === 0 ? <div className="p-8 text-center text-sm text-gray-500">Nenhum processo cadastrado.</div> : null}
      </div>
    </div>
  );
}
