import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { q?: string; ativo?: string };
}

export default async function ClientesPage({ searchParams }: Props) {
  const q = searchParams.q?.trim() ?? "";
  const ativo = searchParams.ativo !== "false";

  const clientes = await prisma.cliente.findMany({
    where: {
      ativo,
      ...(q ? {
        OR: [
          { razaoSocial: { contains: q, mode: "insensitive" } },
          { nomeFantasia: { contains: q, mode: "insensitive" } },
          { cnpj: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
    },
    orderBy: { razaoSocial: "asc" },
    include: { _count: { select: { processos: true, contatos: true } } },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-gray-500">{clientes.length} cliente{clientes.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/dashboard/clientes/novo" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
          Novo cliente
        </Link>
      </div>

      {/* Filtros */}
      <form method="get" className="flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar razão social, fantasia ou CNPJ..."
          className="w-72 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          name="ativo"
          defaultValue={ativo ? "true" : "false"}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => {}}
        >
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
        <button type="submit" className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200">
          Filtrar
        </button>
        {q && (
          <Link href="/dashboard/clientes" className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50">
            Limpar
          </Link>
        )}
      </form>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Razão social</th>
              <th className="px-4 py-3">Nome fantasia</th>
              <th className="px-4 py-3">CNPJ</th>
              <th className="px-4 py-3">Cidade/UF</th>
              <th className="px-4 py-3">Processos</th>
              <th className="px-4 py-3">Contatos</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clientes.map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/dashboard/clientes/${c.id}`} className="hover:text-blue-700">
                    {c.razaoSocial}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{c.nomeFantasia ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs">{c.cnpj ?? "—"}</td>
                <td className="px-4 py-3">
                  {c.cidade && c.uf ? `${c.cidade}/${c.uf}` : c.cidade ?? c.uf ?? "—"}
                </td>
                <td className="px-4 py-3">{c._count.processos}</td>
                <td className="px-4 py-3">{c._count.contatos}</td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/clientes/${c.id}`} className="text-xs text-blue-600 hover:underline">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clientes.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-500">Nenhum cliente encontrado.</div>
        )}
      </div>
    </div>
  );
}
