import { notFound } from "next/navigation";

import { alterarStatus, atribuirResponsaveis } from "@/lib/actions/processos";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { prisma } from "@/lib/db/prisma";
import { formatDate, statusClass, statusLabel } from "@/lib/utils/format";
import { formatCNJ } from "@/lib/utils/cnj";

const STATUS_OPTIONS = ["NOVO","TRIAGEM","DIGITACAO","ELABORACAO","REVISAO","QUALIDADE","AGUARDANDO_CLIENTE","FINALIZADO","CANCELADO"] as const;

export const dynamic = "force-dynamic";

export default async function ProcessoDetalhePage({ params }: { params: { id: string } }) {
  const processo = await prisma.processo.findUnique({
    where: { id: params.id },
    include: {
      cliente: true,
      tipoCalculo: true,
      triador: true,
      digitador: true,
      executor: true,
      movimentacoes: { orderBy: { createdAt: "desc" }, include: { usuario: true } }
    }
  });
  if (!processo) notFound();

  const usuarios = await prisma.usuario.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } });
  const alterarStatusAction = alterarStatus.bind(null, processo.id);
  const atribuirAction = atribuirResponsaveis.bind(null, processo.id);
  const responsaveisFields: Array<[name: string, label: string, value: string | null]> = [
    ["triadorId", "Triador", processo.triadorId],
    ["digitadorId", "Digitador", processo.digitadorId],
    ["executorId", "Executor", processo.executorId]
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{processo.reclamante}</h1>
          <p className="text-sm text-gray-500">{formatCNJ(processo.numeroCnj)} • {processo.cliente.nomeFantasia ?? processo.cliente.razaoSocial}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusClass(processo.status)}`}>{statusLabel(processo.status)}</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 lg:col-span-2">
          <h2 className="font-semibold">Dados do cálculo</h2>
          <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
            <div><dt className="text-gray-500">Tipo</dt><dd className="font-medium">{processo.tipoCalculo.nome}</dd></div>
            <div><dt className="text-gray-500">Reclamada</dt><dd className="font-medium">{processo.reclamada ?? "—"}</dd></div>
            <div><dt className="text-gray-500">Prazo interno</dt><dd className="font-medium">{formatDate(processo.prazoInterno)}</dd></div>
            <div><dt className="text-gray-500">Prazo fatal</dt><dd className="font-medium">{formatDate(processo.prazoFatal)}</dd></div>
            <div><dt className="text-gray-500">Data de entrega</dt><dd className="font-medium">{formatDate(processo.dataEntrega)}</dd></div>
            <div><dt className="text-gray-500">Observação</dt><dd className="font-medium">{processo.observacao ?? "—"}</dd></div>
          </dl>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <h2 className="font-semibold">Responsáveis</h2>
          <form action={atribuirAction} className="mt-4 space-y-3 text-sm">
            {responsaveisFields.map(([name, label, value]) => (
              <label key={name} className="block font-medium">{label}
                <select name={name} defaultValue={value ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
                  <option value="">Não atribuído</option>
                  {usuarios.map((usuario: any) => <option key={usuario.id} value={usuario.id}>{usuario.nome}</option>)}
                </select>
              </label>
            ))}
            <SubmitButton pendingLabel="Salvando..." className="rounded-lg bg-gray-900 px-4 py-2 font-semibold text-white">
              Salvar responsáveis
            </SubmitButton>
          </form>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <h2 className="font-semibold">Alterar status</h2>
          <form action={alterarStatusAction} className="mt-4 space-y-3">
            <select name="status" defaultValue={processo.status} className="w-full rounded-lg border border-gray-300 px-3 py-2">
              {STATUS_OPTIONS.map((status: any) => <option key={status} value={status}>{statusLabel(status)}</option>)}
            </select>
            <textarea name="observacao" rows={3} placeholder="Observação da movimentação" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
            <SubmitButton pendingLabel="Registrando..." className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">
              Registrar movimentação
            </SubmitButton>
          </form>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <h2 className="font-semibold">Histórico</h2>
          <div className="mt-4 space-y-3">
            {processo.movimentacoes.map((mov: any) => (
              <div key={mov.id} className="rounded-xl border border-gray-200 p-3 text-sm">
                <div className="font-medium">{statusLabel(mov.statusAnterior ?? "NOVO")} → {statusLabel(mov.statusNovo)}</div>
                <div className="text-gray-500">{mov.usuario.nome} em {formatDate(mov.createdAt)}</div>
                {mov.observacao ? <p className="mt-1 text-gray-700">{mov.observacao}</p> : null}
              </div>
            ))}
            {processo.movimentacoes.length === 0 ? <p className="text-sm text-gray-500">Ainda não há movimentações.</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
