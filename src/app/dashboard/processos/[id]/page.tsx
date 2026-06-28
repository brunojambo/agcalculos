import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { formatDate, formatDateTime, statusClass, statusLabel } from "@/lib/utils/format";
import { formatCNJ } from "@/lib/utils/cnj";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { alterarStatus, atribuirResponsaveis, editarProcesso } from "@/lib/actions/processos";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS = [
  "NOVO","TRIAGEM","DIGITACAO","ELABORACAO","REVISAO",
  "QUALIDADE","AGUARDANDO_CLIENTE","FINALIZADO","CANCELADO",
] as const;

const STATUS_PROX: Record<string, string[]> = {
  NOVO:               ["TRIAGEM","CANCELADO"],
  TRIAGEM:            ["DIGITACAO","AGUARDANDO_CLIENTE","CANCELADO"],
  DIGITACAO:          ["ELABORACAO","TRIAGEM","CANCELADO"],
  ELABORACAO:         ["REVISAO","DIGITACAO","CANCELADO"],
  REVISAO:            ["QUALIDADE","ELABORACAO","CANCELADO"],
  QUALIDADE:          ["FINALIZADO","REVISAO","AGUARDANDO_CLIENTE","CANCELADO"],
  AGUARDANDO_CLIENTE: ["TRIAGEM","FINALIZADO","CANCELADO"],
  FINALIZADO:         [],
  CANCELADO:          [],
};

export default async function ProcessoDetalhePage({ params }: { params: { id: string } }) {
  const processo = await prisma.processo.findUnique({
    where: { id: params.id },
    include: {
      cliente:     true,
      tipoCalculo: true,
      triador:     { select: { id: true, nome: true } },
      digitador:   { select: { id: true, nome: true } },
      executor:    { select: { id: true, nome: true } },
      movimentacoes: {
        orderBy: { createdAt: "desc" },
        include: { usuario: { select: { nome: true } } },
      },
    },
  });
  if (!processo) notFound();

  const [usuarios, tipos] = await Promise.all([
    prisma.usuario.findMany({ where: { ativo: true }, orderBy: { nome: "asc" },
      select: { id: true, nome: true, role: true } }),
    prisma.tipoCalculo.findMany({ where: { ativo: true }, orderBy: { nome: "asc" },
      select: { id: true, nome: true } }),
  ]);

  const alterarStatusAction  = alterarStatus.bind(null, processo.id);
  const atribuirAction       = atribuirResponsaveis.bind(null, processo.id);
  const editarAction         = editarProcesso.bind(null, processo.id);
  const proxStatus           = STATUS_PROX[processo.status] ?? STATUS_OPTIONS;
  const hoje                 = new Date(); hoje.setHours(0, 0, 0, 0);
  const vencido              = processo.prazoInterno && new Date(processo.prazoInterno) < hoje
                               && !["FINALIZADO","CANCELADO"].includes(processo.status);

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{processo.reclamante}</h1>
            <span className={`rounded-full px-3 py-0.5 text-sm font-semibold ${statusClass(processo.status)}`}>
              {statusLabel(processo.status)}
            </span>
            {vencido && (
              <span className="rounded-full bg-red-100 px-3 py-0.5 text-sm font-semibold text-red-700">
                ⚠ Prazo vencido
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {processo.numeroCnj ? formatCNJ(processo.numeroCnj) : "Sem CNJ"}
            {" · "}
            <Link href={`/dashboard/clientes/${processo.clienteId}`} className="hover:text-blue-700">
              {processo.cliente.nomeFantasia ?? processo.cliente.razaoSocial}
            </Link>
          </p>
        </div>
        <Link href="/dashboard/processos"
          className="shrink-0 rounded-xl border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
          ← Voltar
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Edição dos dados */}
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 lg:col-span-2">
          <h2 className="font-semibold mb-4">Dados do processo</h2>
          <form action={editarAction} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium">
                Número CNJ
                <input name="numeroCnj" defaultValue={processo.numeroCnj ?? ""}
                  placeholder="0000000-00.0000.5.00.0000"
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-mono" />
              </label>
              <label className="block text-sm font-medium">
                Reclamante *
                <input name="reclamante" required defaultValue={processo.reclamante}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" />
              </label>
              <label className="block text-sm font-medium">
                Reclamada
                <input name="reclamada" defaultValue={processo.reclamada ?? ""}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" />
              </label>
              <label className="block text-sm font-medium">
                Tipo de cálculo *
                <select name="tipoCalculoId" required defaultValue={processo.tipoCalculoId}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm bg-white">
                  {tipos.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.nome}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium">
                Prazo interno
                <input name="prazoInterno" type="date"
                  defaultValue={processo.prazoInterno ? processo.prazoInterno.toISOString().slice(0,10) : ""}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" />
              </label>
              <label className="block text-sm font-medium">
                Prazo fatal
                <input name="prazoFatal" type="date"
                  defaultValue={processo.prazoFatal ? processo.prazoFatal.toISOString().slice(0,10) : ""}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" />
              </label>
            </div>
            <label className="block text-sm font-medium">
              Observação
              <textarea name="observacao" rows={3} defaultValue={processo.observacao ?? ""}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" />
            </label>
            <SubmitButton pendingLabel="Salvando..."
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700">
              Salvar dados
            </SubmitButton>
          </form>
        </section>

        {/* Coluna direita */}
        <div className="space-y-5">
          {/* Alterar status */}
          {proxStatus.length > 0 && (
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <h2 className="font-semibold mb-3">Alterar status</h2>
              <form action={alterarStatusAction} className="space-y-3">
                <select name="status"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm bg-white">
                  {proxStatus.map((s) => (
                    <option key={s} value={s}>{statusLabel(s)}</option>
                  ))}
                </select>
                <textarea name="observacao" rows={2} placeholder="Observação (opcional)"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" />
                <SubmitButton pendingLabel="Salvando..."
                  className="w-full rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
                  Confirmar
                </SubmitButton>
              </form>
            </section>
          )}

          {/* Responsáveis */}
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <h2 className="font-semibold mb-3">Responsáveis</h2>
            <form action={atribuirAction} className="space-y-3">
              {([
                ["triadorId",   "Triador",   processo.triadorId],
                ["digitadorId", "Digitador", processo.digitadorId],
                ["executorId",  "Executor",  processo.executorId],
              ] as [string, string, string | null][]).map(([name, label, val]) => (
                <label key={name} className="block text-sm font-medium">
                  {label}
                  <select name={name} defaultValue={val ?? ""}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm bg-white">
                    <option value="">Não atribuído</option>
                    {usuarios.map((u: any) => (
                      <option key={u.id} value={u.id}>{u.nome}</option>
                    ))}
                  </select>
                </label>
              ))}
              <SubmitButton pendingLabel="Salvando..."
                className="w-full rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700">
                Salvar responsáveis
              </SubmitButton>
            </form>
          </section>
        </div>
      </div>

      {/* Histórico */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <h2 className="font-semibold mb-4">Histórico de movimentações</h2>
        {processo.movimentacoes.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma movimentação registrada.</p>
        ) : (
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" />
            <div className="space-y-4">
              {processo.movimentacoes.map((m: any, idx: number) => (
                <div key={m.id} className="relative flex gap-4 pl-8">
                  <div className={`absolute left-0.5 top-1 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center text-xs
                    ${idx === 0 ? statusClass(m.statusNovo) : "bg-gray-200"}`}>
                    {idx === 0 ? "●" : "○"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {m.statusAnterior && (
                        <>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(m.statusAnterior)}`}>
                            {statusLabel(m.statusAnterior)}
                          </span>
                          <span className="text-gray-400 text-xs">→</span>
                        </>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(m.statusNovo)}`}>
                        {statusLabel(m.statusNovo)}
                      </span>
                    </div>
                    {m.observacao && (
                      <p className="mt-1 text-sm text-gray-600">{m.observacao}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      {m.usuario?.nome ?? "Sistema"} · {formatDateTime(m.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
