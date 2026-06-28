import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

const FILA_STATUS = [
  { key: "NOVO",              label: "Novo",          cor: "border-gray-300  bg-gray-50",   badge: "bg-gray-100 text-gray-700" },
  { key: "TRIAGEM",           label: "Triagem",       cor: "border-blue-300  bg-blue-50",   badge: "bg-blue-100 text-blue-700" },
  { key: "DIGITACAO",         label: "Digitação",     cor: "border-violet-300 bg-violet-50", badge: "bg-violet-100 text-violet-700" },
  { key: "ELABORACAO",        label: "Elaboração",    cor: "border-yellow-300 bg-yellow-50", badge: "bg-yellow-100 text-yellow-700" },
  { key: "REVISAO",           label: "Revisão",       cor: "border-orange-300 bg-orange-50", badge: "bg-orange-100 text-orange-700" },
  { key: "QUALIDADE",         label: "Qualidade",     cor: "border-cyan-300  bg-cyan-50",   badge: "bg-cyan-100 text-cyan-700" },
  { key: "AGUARDANDO_CLIENTE",label: "Ag. Cliente",   cor: "border-pink-300  bg-pink-50",   badge: "bg-pink-100 text-pink-700" },
];

export default async function DashboardPage() {
  const hoje = new Date();
  const inicioDia = new Date(hoje); inicioDia.setHours(0, 0, 0, 0);
  const fimDia    = new Date(hoje); fimDia.setHours(23, 59, 59, 999);
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes    = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

  const [
    filaRaw,
    vencidos,
    vencendoHoje,
    cadastradosMes,
    finalizadosMes,
    clientes,
  ] = await Promise.all([
    // Processos em fila agrupados por status (máx 5 por coluna para o painel)
    Promise.all(
      FILA_STATUS.map(async (s) => ({
        ...s,
        processos: await prisma.processo.findMany({
          where: { status: s.key as any },
          orderBy: { prazoInterno: "asc" },
          take: 5,
          select: {
            id: true, reclamante: true, prazoInterno: true,
            cliente: { select: { nomeFantasia: true, razaoSocial: true } },
            executor: { select: { nome: true } },
          },
        }),
        total: await prisma.processo.count({ where: { status: s.key as any } }),
      }))
    ),
    // Vencidos
    prisma.processo.findMany({
      where: {
        prazoInterno: { lt: inicioDia },
        status: { notIn: ["FINALIZADO", "CANCELADO"] },
      },
      orderBy: { prazoInterno: "asc" },
      take: 10,
      select: {
        id: true, reclamante: true, prazoInterno: true, status: true,
        cliente: { select: { nomeFantasia: true, razaoSocial: true } },
        executor: { select: { nome: true } },
      },
    }),
    // Vencendo hoje
    prisma.processo.findMany({
      where: {
        prazoInterno: { gte: inicioDia, lte: fimDia },
        status: { notIn: ["FINALIZADO", "CANCELADO"] },
      },
      orderBy: { prazoInterno: "asc" },
      select: {
        id: true, reclamante: true, prazoInterno: true, status: true,
        cliente: { select: { nomeFantasia: true, razaoSocial: true } },
        executor: { select: { nome: true } },
      },
    }),
    // KPIs do mês
    prisma.processo.count({ where: { dataCadastro: { gte: inicioMes, lte: fimMes } } }),
    prisma.processo.count({ where: { status: "FINALIZADO", dataEntrega: { gte: inicioMes, lte: fimMes } } }),
    prisma.cliente.count({ where: { ativo: true } }),
  ]);

  const totalAtivos = filaRaw.reduce((acc: number, s) => acc + s.total, 0);
  const taxaConclusao = cadastradosMes > 0 ? Math.round((finalizadosMes / cadastradosMes) * 100) : 0;

  const STATUS_LABEL: Record<string, string> = {
    NOVO: "Novo", TRIAGEM: "Triagem", DIGITACAO: "Digitação", ELABORACAO: "Elaboração",
    REVISAO: "Revisão", QUALIDADE: "Qualidade", AGUARDANDO_CLIENTE: "Ag. Cliente",
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Painel operacional</h1>
          <p className="text-sm text-gray-500">
            {hoje.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <Link href="/dashboard/processos/novo"
          className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
          + Novo processo
        </Link>
      </div>

      {/* KPIs do mês */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Ativos na fila",     value: totalAtivos,       sub: "em andamento" },
          { label: "Cadastrados no mês", value: cadastradosMes,    sub: "este mês" },
          { label: "Finalizados no mês", value: finalizadosMes,    sub: `taxa ${taxaConclusao}%` },
          { label: "Clientes ativos",    value: clientes,           sub: "escritórios" },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-500">{k.label}</p>
            <p className="mt-1 text-3xl font-bold">{k.value}</p>
            <p className="mt-1 text-xs text-gray-400">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Alertas de prazo */}
      {(vencidos.length > 0 || vencendoHoje.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {vencidos.length > 0 && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-red-600 font-semibold text-sm">⚠ Prazos vencidos</span>
                <span className="rounded-full bg-red-600 text-white text-xs px-2 py-0.5 font-bold">{vencidos.length}</span>
              </div>
              <div className="space-y-2">
                {vencidos.map((p: any) => (
                  <Link key={p.id} href={`/dashboard/processos/${p.id}`}
                    className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm hover:bg-red-50 border border-red-100">
                    <div>
                      <p className="font-medium text-gray-800 truncate max-w-[180px]">{p.reclamante}</p>
                      <p className="text-xs text-gray-500">{p.cliente.nomeFantasia ?? p.cliente.razaoSocial}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-red-600 font-semibold">{formatDate(p.prazoInterno)}</p>
                      <p className="text-xs text-gray-400">{p.executor?.nome ?? "sem executor"}</p>
                    </div>
                  </Link>
                ))}
                {vencidos.length === 10 && (
                  <Link href="/dashboard/processos?status=NOVO" className="block text-center text-xs text-red-500 hover:underline pt-1">
                    Ver todos →
                  </Link>
                )}
              </div>
            </div>
          )}

          {vencendoHoje.length > 0 && (
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-yellow-700 font-semibold text-sm">🕐 Vencem hoje</span>
                <span className="rounded-full bg-yellow-500 text-white text-xs px-2 py-0.5 font-bold">{vencendoHoje.length}</span>
              </div>
              <div className="space-y-2">
                {vencendoHoje.map((p: any) => (
                  <Link key={p.id} href={`/dashboard/processos/${p.id}`}
                    className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm hover:bg-yellow-50 border border-yellow-100">
                    <div>
                      <p className="font-medium text-gray-800 truncate max-w-[180px]">{p.reclamante}</p>
                      <p className="text-xs text-gray-500">{p.cliente.nomeFantasia ?? p.cliente.razaoSocial}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-yellow-700 font-semibold">{STATUS_LABEL[p.status] ?? p.status}</p>
                      <p className="text-xs text-gray-400">{p.executor?.nome ?? "sem executor"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fila por status */}
      <div>
        <h2 className="font-semibold text-gray-700 mb-3">Fila de produção</h2>
        <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-7">
          {filaRaw.map((col) => (
            <div key={col.key} className={`rounded-2xl border-2 ${col.cor} p-3`}>
              {/* Header da coluna */}
              <div className="flex items-center justify-between mb-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${col.badge}`}>
                  {col.label}
                </span>
                <span className="text-sm font-bold text-gray-700">{col.total}</span>
              </div>

              {/* Processos */}
              <div className="space-y-1.5">
                {col.processos.map((p: any) => (
                  <Link key={p.id} href={`/dashboard/processos/${p.id}`}
                    className="block rounded-xl bg-white px-2.5 py-2 text-xs hover:shadow-sm border border-white hover:border-gray-200 transition-all">
                    <p className="font-medium text-gray-800 truncate">{p.reclamante}</p>
                    <p className="text-gray-400 truncate">{p.cliente.nomeFantasia ?? p.cliente.razaoSocial}</p>
                    {p.prazoInterno && (
                      <p className={`mt-0.5 font-medium ${new Date(p.prazoInterno) < hoje ? "text-red-500" : "text-gray-400"}`}>
                        {formatDate(p.prazoInterno)}
                      </p>
                    )}
                  </Link>
                ))}
                {col.total > 5 && (
                  <Link href={`/dashboard/processos?status=${col.key}`}
                    className="block text-center text-xs text-gray-400 hover:text-blue-600 pt-1">
                    +{col.total - 5} mais →
                  </Link>
                )}
                {col.total === 0 && (
                  <p className="text-center text-xs text-gray-400 py-2">Vazio</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
