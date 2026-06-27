import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({ orderBy: { razaoSocial: "asc" }, include: { _count: { select: { processos: true } } } });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-gray-500">Base inicial do Kronos/CRM.</p>
        </div>
        <Link href="/dashboard/clientes/novo" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">Novo cliente</Link>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Razão social</th>
              <th className="px-4 py-3">Nome fantasia</th>
              <th className="px-4 py-3">CNPJ</th>
              <th className="px-4 py-3">Cidade/UF</th>
              <th className="px-4 py-3">Processos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td className="px-4 py-3 font-medium">{cliente.razaoSocial}</td>
                <td className="px-4 py-3">{cliente.nomeFantasia ?? "—"}</td>
                <td className="px-4 py-3">{cliente.cnpj ?? "—"}</td>
                <td className="px-4 py-3">{cliente.cidade ?? "—"}/{cliente.uf ?? "—"}</td>
                <td className="px-4 py-3">{cliente._count.processos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
