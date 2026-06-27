import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { editarCliente, toggleAtivoCliente, adicionarContato, removerContato } from "@/lib/actions/clientes";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function ClienteDetalhePage({ params }: { params: { id: string } }) {
  const cliente = await prisma.cliente.findUnique({
    where: { id: params.id },
    include: {
      contatos: { orderBy: { nome: "asc" } },
      processos: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { tipoCalculo: true },
      },
      _count: { select: { processos: true } },
    },
  });

  if (!cliente) notFound();

  const editarAction = editarCliente.bind(null, cliente.id);
  const toggleAction = toggleAtivoCliente.bind(null, cliente.id);
  const adicionarContatoAction = adicionarContato.bind(null, cliente.id);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{cliente.razaoSocial}</h1>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cliente.ativo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {cliente.ativo ? "Ativo" : "Inativo"}
            </span>
          </div>
          {cliente.nomeFantasia && <p className="text-sm text-gray-500">{cliente.nomeFantasia}</p>}
        </div>
        <div className="flex gap-2">
          <form action={toggleAction}>
            <button type="submit" className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${cliente.ativo ? "border-red-300 text-red-600 hover:bg-red-50" : "border-green-300 text-green-600 hover:bg-green-50"}`}>
              {cliente.ativo ? "Desativar" : "Reativar"}
            </button>
          </form>
          <Link href="/dashboard/clientes" className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50">
            Voltar
          </Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Edição */}
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 lg:col-span-2">
          <h2 className="font-semibold">Dados do cliente</h2>
          <form action={editarAction} className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium">
                Razão social
                <input name="razaoSocial" defaultValue={cliente.razaoSocial} required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </label>
              <label className="block text-sm font-medium">
                Nome fantasia
                <input name="nomeFantasia" defaultValue={cliente.nomeFantasia ?? ""}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="block text-sm font-medium md:col-span-2">
                CNPJ
                <input name="cnpj" defaultValue={cliente.cnpj ?? ""}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </label>
              <label className="block text-sm font-medium">
                UF
                <input name="uf" defaultValue={cliente.uf ?? ""} maxLength={2}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase" />
              </label>
            </div>
            <label className="block text-sm font-medium">
              Cidade
              <input name="cidade" defaultValue={cliente.cidade ?? ""}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </label>
            <SubmitButton pendingLabel="Salvando..." className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white">
              Salvar dados
            </SubmitButton>
          </form>
        </section>

        {/* Contatos */}
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <h2 className="font-semibold">Contatos</h2>

          {/* Lista de contatos */}
          <div className="mt-3 space-y-2">
            {cliente.contatos.map((c) => (
              <div key={c.id} className="flex items-start justify-between rounded-xl border border-gray-200 p-3 text-sm">
                <div>
                  <p className="font-medium">{c.nome}</p>
                  {c.cargo && <p className="text-xs text-gray-500">{c.cargo}</p>}
                  {c.email && <p className="text-xs text-gray-600">{c.email}</p>}
                  {c.telefone && <p className="text-xs text-gray-600">{c.telefone}</p>}
                </div>
                <form action={removerContato.bind(null, c.id, cliente.id)}>
                  <button type="submit" className="text-xs text-red-400 hover:text-red-600">
                    Remover
                  </button>
                </form>
              </div>
            ))}
            {cliente.contatos.length === 0 && (
              <p className="text-sm text-gray-500">Nenhum contato cadastrado.</p>
            )}
          </div>

          {/* Adicionar contato */}
          <form action={adicionarContatoAction} className="mt-4 space-y-2 border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold uppercase text-gray-400">Adicionar contato</p>
            <input name="nome" required placeholder="Nome *"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <input name="cargo" placeholder="Cargo"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <input name="email" type="email" placeholder="E-mail"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <input name="telefone" placeholder="Telefone"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <SubmitButton pendingLabel="Adicionando..." className="w-full rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white">
              Adicionar contato
            </SubmitButton>
          </form>
        </section>
      </div>

      {/* Processos recentes */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Processos ({cliente._count.processos})</h2>
          <Link href={`/dashboard/processos?clienteId=${cliente.id}`} className="text-xs text-blue-600 hover:underline">
            Ver todos
          </Link>
        </div>
        <div className="mt-3 divide-y divide-gray-100">
          {cliente.processos.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <Link href={`/dashboard/processos/${p.id}`} className="font-medium hover:text-blue-700">
                  {p.reclamante}
                </Link>
                <span className="ml-2 text-xs text-gray-500">{p.tipoCalculo.nome}</span>
              </div>
              <span className="text-xs text-gray-400">{formatDate(p.createdAt)}</span>
            </div>
          ))}
          {cliente.processos.length === 0 && (
            <p className="py-3 text-sm text-gray-500">Nenhum processo vinculado.</p>
          )}
        </div>
      </section>
    </div>
  );
}
