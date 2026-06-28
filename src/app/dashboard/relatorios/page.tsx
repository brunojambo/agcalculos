import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  NOVO: "Novo", TRIAGEM: "Triagem", DIGITACAO: "Digitação",
  ELABORACAO: "Elaboração", REVISAO: "Revisão", QUALIDADE: "Qualidade",
  AGUARDANDO_CLIENTE: "Ag. Cliente", FINALIZADO: "Finalizado", CANCELADO: "Cancelado",
};

const STATUS_COR: Record<string, string> = {
  NOVO: "bg-gray-100 text-gray-700",
  TRIAGEM: "bg-blue-100 text-blue-700",
  DIGITACAO: "bg-violet-100 text-violet-700",
  ELABORACAO: "bg-yellow-100 text-yellow-700",
  REVISAO: "bg-orange-100 text-orange-700",
  QUALIDADE: "bg-cyan-100 text-cyan-700",
  AGUARDANDO_CLIENTE: "bg-pink-100 text-pink-700",
  FINALIZADO: "bg-green-100 text-green-700",
  CANCELADO: "bg-red-100 text-red-700",
};

interface Props {
  searchParams: { tab?: string; de?: string; ate?: string; clienteId?: string };
}

export default async function RelatoriosPage({ searchParams }: Props) {
  const tab = searchParams.tab ?? "producao";
  const de = searchParams.de ? new Date(`${searchParams.de}T00:00:00-03:00`) : null;
  const ate = searchParams.ate ? new Date(`${searchParams.ate}T23:59:59-03:00`) : null;
  const clienteId = searchParams.clienteId ?? "";

  const whereBase: any = {
    ...(de || ate ? { dataCadastro: { ...(de ? { gte: de } : {}), ...(ate ? { lte: ate } : {}) } } : {}),
    ...(clienteId ? { clienteId } : {}),
  };

  const [
    porStatus,
    porTipo,
    porExecutor,
    porCliente,
    finalizados,
    clientes,
  ] = await Promise.all([
    // Contagem por status
    prisma.processo.groupBy({
      by: ["status"],
      where: whereBase,
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    // Contagem por tipo de cálculo
    prisma.processo.groupBy({
      by: ["tipoCalculoId"],
      where: whereBase,
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    // Produção por executor
    prisma.usuario.findMany({
      where: { ativo: true },
      select: {
        id: true, nome: true, role: true,
        _count: {
          select: {
            processosExecucao: { where: whereBase },
            processosTriagem: { where: whereBase },
            processosDigitacao: { where: whereBase },
          },
        },
      },
      orderBy: { nome: "asc" },
    }),
    // Volume por cliente
    prisma.cliente.findMany({
      where: { ativo: true },
      select: {
        id: true, razaoSocial: true, nomeFantasia: true,
        _count: { select: { processos: { where: whereBase } } },
      },
      orderBy: { razaoSocial: "asc" },
    }),
    // Finalizados
    prisma.processo.findMany({
      where: { ...whereBase, status: "FINALIZADO" },
      orderBy: { dataEntrega: "desc" },
      take: 200,
      include: { cliente: true, tipoCalculo: true, executor: true },
    }),
    // Lista de clientes para o filtro
    prisma.cliente.findMany({
      where: { ativo: true },
      orderBy: { razaoSocial: "asc" },
      select: { id: true, razaoSocial: true, nomeFantasia: true },
    }),
  ]);

  // Enriquecer porTipo com nomes
  const tiposMap = await prisma.tipoCalculo.findMany({ select: { id: true, nome: true } });
  const tipoNome = Object.fromEntries(tiposMap.map((t: any) => [t.id, t.nome]));

  const totalProcessos = porStatus.reduce((acc: number, s: any) => acc + s._count.id, 0);

  const tabs = [
    { key: "producao", label: "Produção" },
    { key: "executores", label: "Por executor" },
    { key: "clientes", label: "Por cliente" },
    { key: "finalizados", label: "Finalizados" },
  ];

  function buildHref(newTab: string) {
    const p = new URLSearchParams({
      tab: newTab,
      ...(de ? { de: searchParams.de! } : {}),
      ...(ate ? { ate: searchParams.ate! } : {}),
      ...(clienteId ? { clienteId } : {}),
    });
    return `/dashboard/relatorios?${p.toString()}`;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-sm text-gray-500">Visão operacional e de produção.</p>
      </div>

      {/* Filtros de período */}
      <form method="get" className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
        <input type="hidden" name="tab" value={tab} />
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">De</label>
          <input type="date" name="de" defaultValue={searchParams.de ?? ""}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Até</label>
          <input type="date" name="ate" defaultValue={searchParams.ate ?? ""}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Cliente</label>
          <select name="clienteId" defaultValue={clienteId}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todos os clientes</option>
            {clientes.map((c: any) => (
              <option key={c.id} value={c.id}>{c.nomeFantasia ?? c.razaoSocial}</option>
            ))}
          </select>
        </div>
        <button type="submit"
          className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
          Filtrar
        </button>
        {(de || ate || clienteId) && (
          <Link href="/dashboard/relatorios"
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50">
            Limpar
          </Link>
        )}
        <span className="ml-auto text-sm text-gray-500 self-center">
          {totalProcessos} processo{totalProcessos !== 1 ? "s" : ""} no período
        </span>
      </form>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((t) => (
          <Link key={t.key} href={buildHref(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {t.label}
          </Link>
        ))}
      </div>

      {/* Tab: Produção */}
      {tab === "producao" && (
        <div className="grid gap-5 md:grid-cols-2">
          {/* Por status */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <h2 className="font-semibold mb-3">Por status</h2>
            <div className="space-y-2">
              {porStatus.map((s: any) => (
                <div key={s.status} className="flex items-center justify-between">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COR[s.status] ?? "bg-gray-100"}`}>
                    {STATUS_LABEL[s.status] ?? s.status}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: totalProcessos ? `${(s._count.id / totalProcessos) * 100}%` : "0%" }}
                      />
                    </div>
                    <span className="text-sm font-medium w-6 text-right">{s._count.id}</span>
                  </div>
                </div>
              ))}
              {porStatus.length === 0 && <p className="text-sm text-gray-500">Nenhum dado.</p>}
            </div>
          </div>

          {/* Por tipo de cálculo */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <h2 className="font-semibold mb-3">Por tipo de cálculo</h2>
            <div className="space-y-2">
              {porTipo.map((t: any) => (
                <div key={t.tipoCalculoId} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-700 truncate flex-1">
                    {tipoNome[t.tipoCalculoId] ?? "—"}
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-24 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: totalProcessos ? `${(t._count.id / totalProcessos) * 100}%` : "0%" }}
                      />
                    </div>
                    <span className="text-sm font-medium w-6 text-right">{t._count.id}</span>
                  </div>
                </div>
              ))}
              {porTipo.length === 0 && <p className="text-sm text-gray-500">Nenhum dado.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Por executor */}
      {tab === "executores" && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Usuário</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-center">Triagem</th>
                <th className="px-4 py-3 text-center">Digitação</th>
                <th className="px-4 py-3 text-center">Execução</th>
                <th className="px-4 py-3 text-center">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {porExecutor
                .map((u: any) => ({
                  ...u,
                  total: u._count.processosExecucao + u._count.processosTriagem + u._count.processosDigitacao,
                }))
                .sort((a: any, b: any) => b.total - a.total)
                .map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{u.nome}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{u.role}</td>
                    <td className="px-4 py-3 text-center">{u._count.processosTriagem}</td>
                    <td className="px-4 py-3 text-center">{u._count.processosDigitacao}</td>
                    <td className="px-4 py-3 text-center">{u._count.processosExecucao}</td>
                    <td className="px-4 py-3 text-center font-semibold">{u.total}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {porExecutor.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-500">Nenhum dado.</div>
          )}
        </div>
      )}

      {/* Tab: Por cliente */}
      {tab === "clientes" && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3 text-center">Processos</th>
                <th className="px-4 py-3">% do total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...porCliente]
                .sort((a: any, b: any) => b._count.processos - a._count.processos)
                .filter((c: any) => c._count.processos > 0)
                .map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/dashboard/clientes/${c.id}`} className="hover:text-blue-700">
                        {c.nomeFantasia ?? c.razaoSocial}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-center">{c._count.processos}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: totalProcessos ? `${(c._count.processos / totalProcessos) * 100}%` : "0%" }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {totalProcessos ? Math.round((c._count.processos / totalProcessos) * 100) : 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {porCliente.every((c: any) => c._count.processos === 0) && (
            <div className="p-8 text-center text-sm text-gray-500">Nenhum dado no período.</div>
          )}
        </div>
      )}

      {/* Tab: Finalizados */}
      {tab === "finalizados" && (
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
              {finalizados.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{formatDate(p.dataEntrega)}</td>
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/dashboard/processos/${p.id}`} className="hover:text-blue-700">
                      {p.reclamante}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{p.cliente.nomeFantasia ?? p.cliente.razaoSocial}</td>
                  <td className="px-4 py-3">{p.tipoCalculo.nome}</td>
                  <td className="px-4 py-3">{p.executor?.nome ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {finalizados.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-500">Nenhum processo finalizado no período.</div>
          )}
          {finalizados.length === 200 && (
            <div className="p-3 text-center text-xs text-gray-400">Mostrando os 200 mais recentes. Use os filtros de período para refinar.</div>
          )}
        </div>
      )}
    </div>
  );
}
