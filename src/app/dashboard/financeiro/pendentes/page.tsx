import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function PendentesPage() {
  const pendentes = await prisma.processo.findMany({
    where: { status: "FINALIZADO", faturaItens: { none: {} } },
    orderBy: [{ clienteId: "asc" }, { dataEntrega: "desc" }],
    include: {
      cliente: { select: { id: true, razaoSocial: true, nomeFantasia: true } },
      tipoCalculo: { select: { nome: true } },
      executor: { select: { nome: true } },
    },
  });

  // Agrupar por cliente
  const porCliente: Record<string, { cliente: any; processos: any[] }> = {};
  for (const p of pendentes) {
    if (!porCliente[p.clienteId]) {
      porCliente[p.clienteId] = { cliente: p.cliente, processos: [] };
    }
    porCliente[p.clienteId].processos.push(p);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pendentes de fatura</h1>
          <p className="text-sm text-gray-500">
            {pendentes.length} processo{pendentes.length !== 1 ? "s" : ""} finalizados sem fatura.
          </p>
        </div>
        <Link href="/dashboard/financeiro"
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
          Voltar
        </Link>
      </div>

      {Object.values(porCliente).map(({ cliente, processos }: any) => (
        <div key={cliente.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
            <Link href={`/dashboard/clientes/${cliente.id}`}
              className="font-semibold hover:text-blue-700">
              {cliente.nomeFantasia ?? cliente.razaoSocial}
            </Link>
            <span className="text-sm text-gray-500">{processos.length} processo{processos.length !== 1 ? "s" : ""}</span>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              {processos.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-5 py-2.5 font-medium">
                    <Link href={`/dashboard/processos/${p.id}`} className="hover:text-blue-700">
                      {p.reclamante}
                    </Link>
                  </td>
                  <td className="px-5 py-2.5 text-gray-500">{p.tipoCalculo.nome}</td>
                  <td className="px-5 py-2.5 text-gray-500">{p.executor?.nome ?? "—"}</td>
                  <td className="px-5 py-2.5 text-gray-400 text-right">{formatDate(p.dataEntrega)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {pendentes.length === 0 && (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200">
          <p className="text-gray-500">Todos os processos finalizados já foram faturados.</p>
        </div>
      )}
    </div>
  );
}
