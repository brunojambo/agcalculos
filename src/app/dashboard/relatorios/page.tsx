import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function RelatoriosPage() {
  const finalizados = await prisma.processo.findMany({
    where: { status: "FINALIZADO" },
    orderBy: { dataEntrega: "desc" },
    include: { cliente: true, tipoCalculo: true, executor: true }
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-sm text-gray-500">Primeiro relatório: cálculos finalizados e prontos para conferência/faturamento.</p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Entrega</th>
              <th className="px-4 py-3">Reclamante</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Executor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {finalizados.map((processo) => (
              <tr key={processo.id}>
                <td className="px-4 py-3">{formatDate(processo.dataEntrega)}</td>
                <td className="px-4 py-3 font-medium">{processo.reclamante}</td>
                <td className="px-4 py-3">{processo.cliente.nomeFantasia ?? processo.cliente.razaoSocial}</td>
                <td className="px-4 py-3">{processo.tipoCalculo.nome}</td>
                <td className="px-4 py-3">{processo.executor?.nome ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {finalizados.length === 0 ? <div className="p-8 text-center text-sm text-gray-500">Nenhum cálculo finalizado ainda.</div> : null}
      </div>
    </div>
  );
}
