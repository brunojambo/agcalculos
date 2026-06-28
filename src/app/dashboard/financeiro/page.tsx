import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils/format";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { criarFatura } from "@/lib/actions/financeiro";

export const dynamic = "force-dynamic";

const STATUS_COR: Record<string, string> = {
  ABERTA:    "bg-blue-100 text-blue-700",
  FECHADA:   "bg-yellow-100 text-yellow-700",
  PAGA:      "bg-green-100 text-green-700",
  CANCELADA: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<string, string> = {
  ABERTA: "Aberta", FECHADA: "Fechada", PAGA: "Paga", CANCELADA: "Cancelada",
};

interface Props {
  searchParams: { status?: string };
}

export default async function FinanceiroPage({ searchParams }: Props) {
  const statusFiltro = searchParams.status ?? "";

  const [faturas, clientes, semFatura] = await Promise.all([
    prisma.fatura.findMany({
      where: statusFiltro ? { status: statusFiltro as any } : {},
      orderBy: { createdAt: "desc" },
      include: {
        cliente: { select: { razaoSocial: true, nomeFantasia: true } },
        _count: { select: { itens: true } },
      },
    }),
    prisma.cliente.findMany({
      where: { ativo: true },
      orderBy: { razaoSocial: "asc" },
      select: { id: true, razaoSocial: true, nomeFantasia: true },
    }),
    prisma.processo.count({
      where: { status: "FINALIZADO", faturaItens: { none: {} } },
    }),
  ]);

  const totalAberto = faturas
    .filter((f: any) => f.status === "ABERTA" || f.status === "FECHADA")
    .reduce((acc: number, f: any) => acc + Number(f.valorTotal ?? 0), 0);

  const STATUS_TABS = ["", "ABERTA", "FECHADA", "PAGA", "CANCELADA"];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financeiro</h1>
          <p className="text-sm text-gray-500">Faturamento por cliente.</p>
        </div>
        {semFatura > 0 && (
          <Link href="/dashboard/financeiro/pendentes"
            className="rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm font-semibold text-yellow-700 hover:bg-yellow-100">
            {semFatura} processo{semFatura !== 1 ? "s" : ""} sem fatura
          </Link>
        )}
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <p className="text-sm text-gray-500">A receber</p>
          <p className="mt-1 text-2xl font-bold text-green-700">
            {totalAberto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          <p className="text-xs text-gray-400 mt-1">faturas abertas e fechadas</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <p className="text-sm text-gray-500">Faturas abertas</p>
          <p className="mt-1 text-2xl font-bold">{faturas.filter((f: any) => f.status === "ABERTA").length}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <p className="text-sm text-gray-500">Processos sem fatura</p>
          <p className="mt-1 text-2xl font-bold text-yellow-600">{semFatura}</p>
        </div>
      </div>

      {/* Nova fatura */}
      <form action={criarFatura}
        className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 space-y-3">
        <p className="text-sm font-semibold">Nova fatura</p>
        <div className="flex flex-wrap gap-3">
          <select name="clienteId" required
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Selecionar cliente *</option>
            {clientes.map((c: any) => (
              <option key={c.id} value={c.id}>{c.nomeFantasia ?? c.razaoSocial}</option>
            ))}
          </select>
          <input name="competencia" type="month" required
            defaultValue={new Date().toISOString().slice(0, 7)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <SubmitButton pendingLabel="Criando..."
            className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
            Criar fatura
          </SubmitButton>
        </div>
      </form>

      {/* Filtro de status */}
      <div className="flex gap-1 border-b border-gray-200">
        {STATUS_TABS.map((s) => (
          <Link key={s} href={s ? `/dashboard/financeiro?status=${s}` : "/dashboard/financeiro"}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              statusFiltro === s
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {s ? STATUS_LABEL[s] : "Todas"}
          </Link>
        ))}
      </div>

      {/* Tabela de faturas */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Competência</th>
              <th className="px-4 py-3 text-center">Itens</th>
              <th className="px-4 py-3 text-right">Valor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Criada em</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {faturas.map((f: any) => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">
                  {f.cliente.nomeFantasia ?? f.cliente.razaoSocial}
                </td>
                <td className="px-4 py-3">{f.competencia}</td>
                <td className="px-4 py-3 text-center">{f._count.itens}</td>
                <td className="px-4 py-3 text-right font-medium">
                  {f.valorTotal
                    ? Number(f.valorTotal).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COR[f.status]}`}>
                    {STATUS_LABEL[f.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(f.createdAt)}</td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/financeiro/${f.id}`}
                    className="text-xs text-blue-600 hover:underline">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {faturas.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-500">Nenhuma fatura encontrada.</div>
        )}
      </div>
    </div>
  );
}
