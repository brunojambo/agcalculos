import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export default async function DashboardPage() {
  const [total, finalizados, pendentes, clientes] = await Promise.all([
    prisma.processo.count(),
    prisma.processo.count({ where: { status: "FINALIZADO" } }),
    prisma.processo.count({ where: { status: { notIn: ["FINALIZADO", "CANCELADO"] } } }),
    prisma.cliente.count({ where: { ativo: true } })
  ]);

  const cards = [
    { label: "Processos", value: total },
    { label: "Pendentes", value: pendentes },
    { label: "Finalizados", value: finalizados },
    { label: "Clientes ativos", value: clientes }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Painel operacional</h1>
          <p className="text-sm text-gray-500">Visão inicial do fluxo de cálculos.</p>
        </div>
        <Link href="/dashboard/processos/novo" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">Novo processo</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <div className="text-sm text-gray-500">{card.label}</div>
            <div className="mt-2 text-3xl font-bold">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <h2 className="font-semibold">Próxima melhoria natural</h2>
        <p className="mt-1 text-sm text-gray-600">Transformar este painel em fila por status: novo, triagem, elaboração, revisão, qualidade e finalizados.</p>
      </div>
    </div>
  );
}
