import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils/format";
import { SubmitButton } from "@/components/forms/SubmitButton";
import {
  adicionarItemFatura, removerItemFatura,
  fecharFatura, reabrirFatura, marcarPaga, cancelarFatura,
} from "@/lib/actions/financeiro";

export const dynamic = "force-dynamic";

const STATUS_COR: Record<string, string> = {
  ABERTA: "bg-blue-100 text-blue-700", FECHADA: "bg-yellow-100 text-yellow-700",
  PAGA: "bg-green-100 text-green-700", CANCELADA: "bg-red-100 text-red-700",
};

export default async function FaturaDetalhePage({ params }: { params: { id: string } }) {
  const fatura = await prisma.fatura.findUnique({
    where: { id: params.id },
    include: {
      cliente: true,
      itens: {
        include: { processo: { select: { id: true, reclamante: true, tipoCalculo: { select: { nome: true } } } } },
        orderBy: { id: "asc" },
      },
    },
  });

  if (!fatura) notFound();

  // Processos finalizados do cliente ainda sem fatura
  const disponiveis = await prisma.processo.findMany({
    where: {
      clienteId: fatura.clienteId,
      status: "FINALIZADO",
      faturaItens: { none: {} },
    },
    orderBy: { dataEntrega: "desc" },
    select: { id: true, reclamante: true, dataEntrega: true, tipoCalculo: { select: { nome: true } } },
  });

  const totalItens = fatura.itens.reduce((acc: number, i: any) => acc + Number(i.valor), 0);
  const podeEditar = fatura.status === "ABERTA";

  const adicionarAction = adicionarItemFatura.bind(null, fatura.id);
  const fecharAction = fecharFatura.bind(null, fatura.id);
  const reabrirAction = reabrirFatura.bind(null, fatura.id);
  const pagarAction = marcarPaga.bind(null, fatura.id);
  const cancelarAction = cancelarFatura.bind(null, fatura.id);

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              Fatura — {fatura.cliente.nomeFantasia ?? fatura.cliente.razaoSocial}
            </h1>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COR[fatura.status]}`}>
              {fatura.status}
            </span>
          </div>
          <p className="text-sm text-gray-500">Competência: {fatura.competencia} · Criada em {formatDate(fatura.createdAt)}</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {fatura.status === "ABERTA" && (
            <form action={fecharAction}>
              <SubmitButton pendingLabel="Fechando..."
                className="rounded-xl bg-yellow-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-yellow-600">
                Fechar fatura
              </SubmitButton>
            </form>
          )}
          {fatura.status === "FECHADA" && (
            <>
              <form action={reabrirAction}>
                <SubmitButton pendingLabel="Reabrindo..."
                  className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50">
                  Reabrir
                </SubmitButton>
              </form>
              <form action={pagarAction}>
                <SubmitButton pendingLabel="Marcando..."
                  className="rounded-xl bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700">
                  Marcar como paga
                </SubmitButton>
              </form>
            </>
          )}
          {(fatura.status === "ABERTA" || fatura.status === "FECHADA") && (
            <form action={cancelarAction}>
              <SubmitButton pendingLabel="Cancelando..."
                className="rounded-xl border border-red-300 text-red-600 px-3 py-1.5 text-sm font-medium hover:bg-red-50">
                Cancelar
              </SubmitButton>
            </form>
          )}
          <Link href="/dashboard/financeiro"
            className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50">
            Voltar
          </Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Itens da fatura */}
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Itens da fatura</h2>
            <p className="text-lg font-bold">
              {totalItens.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          </div>

          {fatura.itens.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum item adicionado.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-2 text-left">Processo</th>
                  <th className="px-3 py-2 text-left">Tipo</th>
                  <th className="px-3 py-2 text-left">Descrição</th>
                  <th className="px-3 py-2 text-right">Valor</th>
                  {podeEditar && <th className="px-3 py-2" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fatura.itens.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium">
                      <Link href={`/dashboard/processos/${item.processo.id}`} className="hover:text-blue-700">
                        {item.processo.reclamante}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-gray-500">{item.processo.tipoCalculo.nome}</td>
                    <td className="px-3 py-2 text-gray-500">{item.descricao || "—"}</td>
                    <td className="px-3 py-2 text-right font-medium">
                      {Number(item.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    {podeEditar && (
                      <td className="px-3 py-2">
                        <form action={removerItemFatura.bind(null, item.id, fatura.id)}>
                          <button type="submit" className="text-xs text-red-400 hover:text-red-600">
                            Remover
                          </button>
                        </form>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Adicionar item */}
          {podeEditar && disponiveis.length > 0 && (
            <form action={adicionarAction} className="border-t border-gray-100 pt-4 space-y-3">
              <p className="text-xs font-semibold uppercase text-gray-400">Adicionar processo</p>
              <div className="flex flex-wrap gap-3">
                <select name="processoId" required
                  className="flex-1 min-w-0 rounded-xl border border-gray-300 px-3 py-2 text-sm">
                  <option value="">Selecionar processo finalizado *</option>
                  {disponiveis.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.reclamante} — {p.tipoCalculo.nome} ({formatDate(p.dataEntrega)})
                    </option>
                  ))}
                </select>
                <input name="valor" type="number" step="0.01" min="0" required placeholder="Valor R$ *"
                  className="w-32 rounded-xl border border-gray-300 px-3 py-2 text-sm" />
                <input name="descricao" placeholder="Descrição (opcional)"
                  className="w-48 rounded-xl border border-gray-300 px-3 py-2 text-sm" />
                <SubmitButton pendingLabel="Adicionando..."
                  className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
                  Adicionar
                </SubmitButton>
              </div>
            </form>
          )}

          {podeEditar && disponiveis.length === 0 && (
            <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
              Nenhum processo finalizado disponível para este cliente.
            </p>
          )}
        </section>

        {/* Info da fatura */}
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 space-y-3">
          <h2 className="font-semibold">Resumo</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Cliente</span>
              <span className="font-medium">{fatura.cliente.nomeFantasia ?? fatura.cliente.razaoSocial}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Competência</span>
              <span>{fatura.competencia}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Itens</span>
              <span>{fatura.itens.length}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-green-700">
                {totalItens.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
            {fatura.valorTotal && Number(fatura.valorTotal) !== totalItens && (
              <div className="flex justify-between">
                <span className="text-gray-500">Valor fechado</span>
                <span className="font-medium">
                  {Number(fatura.valorTotal).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
