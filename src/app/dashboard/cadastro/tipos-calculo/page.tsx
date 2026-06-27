import { prisma } from "@/lib/db/prisma";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { criarTipoCalculo, toggleAtivoTipoCalculo } from "@/lib/actions/cadastro";

export const dynamic = "force-dynamic";

export default async function TiposCalculoPage() {
  const tipos = await prisma.tipoCalculo.findMany({
    orderBy: { nome: "asc" },
    include: { _count: { select: { processos: true } } },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Tipos de cálculo</h1>
        <p className="text-sm text-gray-500">{tipos.length} tipo{tipos.length !== 1 ? "s" : ""} cadastrado{tipos.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Formulário de cadastro */}
      <form action={criarTipoCalculo} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <p className="mb-3 text-sm font-semibold">Novo tipo de cálculo</p>
        <div className="flex gap-3">
          <input
            name="nome"
            required
            placeholder="Nome do tipo (ex: Impugnação aos Cálculos)"
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="descricao"
            placeholder="Descrição (opcional)"
            className="w-64 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <SubmitButton
            pendingLabel="Salvando..."
            className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Adicionar
          </SubmitButton>
        </div>
      </form>

      {/* Tabela */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Processos</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tipos.map((t: any) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{t.nome}</td>
                <td className="px-4 py-3 text-gray-500">{t.descricao ?? "—"}</td>
                <td className="px-4 py-3">{t._count.processos}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${t.ativo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {t.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <form action={toggleAtivoTipoCalculo.bind(null, t.id)}>
                    <button
                      type="submit"
                      className="text-xs text-gray-400 hover:text-gray-700"
                      disabled={t._count.processos > 0 && t.ativo}
                      title={t._count.processos > 0 && t.ativo ? "Possui processos vinculados" : ""}
                    >
                      {t.ativo ? "Desativar" : "Reativar"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tipos.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-500">Nenhum tipo cadastrado ainda.</div>
        )}
      </div>
    </div>
  );
}
