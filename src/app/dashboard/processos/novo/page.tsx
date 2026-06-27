import { criarProcesso } from "@/lib/actions/processos";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function NovoProcessoPage() {
  const [clientes, tipos] = await Promise.all([
    prisma.cliente.findMany({ where: { ativo: true }, orderBy: { razaoSocial: "asc" } }),
    prisma.tipoCalculo.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } })
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Novo processo</h1>
        <p className="text-sm text-gray-500">Cadastre a entrada inicial do cálculo.</p>
      </div>

      <form action={criarProcesso} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">Número CNJ
            <input name="numeroCnj" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="0000000-00.2026.5.00.0000" />
          </label>
          <label className="text-sm font-medium">Cliente
            <select name="clienteId" required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
              <option value="">Selecione</option>
              {clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.nomeFantasia ?? cliente.razaoSocial}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium">Reclamante
            <input name="reclamante" required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium">Reclamada
            <input name="reclamada" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium">Tipo de cálculo
            <select name="tipoCalculoId" required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
              <option value="">Selecione</option>
              {tipos.map((tipo) => <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium">Prazo interno
            <input name="prazoInterno" type="date" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium">Prazo fatal
            <input name="prazoFatal" type="date" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
        </div>
        <label className="block text-sm font-medium">Observação
          <textarea name="observacao" rows={4} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
        </label>
        <button className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">Cadastrar processo</button>
      </form>
    </div>
  );
}
