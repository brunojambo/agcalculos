import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { formatDate, statusClass, statusLabel } from "@/lib/utils/format";
import { formatCNJ } from "@/lib/utils/cnj";
import { ProcessosFiltros } from "@/components/processos/ProcessosFiltros";

export const dynamic = "force-dynamic";

const POR_PAGINA = 100;

interface Props {
  searchParams: {
    q?: string;
    status?: string;
    clienteId?: string;
    page?: string;
  };
}

export default async function ProcessosPage({ searchParams }: Props) {
  const q = searchParams.q?.trim() ?? "";
  const status = searchParams.status as string | undefined;
  const clienteId = searchParams.clienteId ?? "";
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const skip = (page - 1) * POR_PAGINA;

  const where = {
    ...(status ? { status } : {}),
    ...(clienteId ? { clienteId } : {}),
    ...(q
      ? {
          OR: [
            { numeroCnj: { contains: q, mode: "insensitive" as const } },
            { reclamante: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [processos, total, clientes] = await Promise.all([
    prisma.processo.findMany({
      where,
      orderBy: [{ prazoInterno: "asc" }, { createdAt: "desc" }],
      include: { cliente: true, tipoCalculo: true, executor: true },
      skip,
      take: POR_PAGINA,
    }),
    prisma.processo.count({ where }),
    prisma.cliente.findMany({
      where: { ativo: true },
      orderBy: { razaoSocial: "asc" },
      select: { id: true, razaoSocial: true, nomeFantasia: true },
    }),
  ]);

  const totalPaginas = Math.ceil(total / POR_PAGINA);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Processos</h1>
          <p className="text-sm text-gray-500">
            {total} processo{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/processos/novo"
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Novo processo
        </Link>
      </div>

      <ProcessosFiltros clientes={clientes} />

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Processo</th>
              <th className="px-4 py-3">Reclamante</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Prazo</th>
              <th className="px-4 py-3">Executor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {processos.map((processo: any) => (
              <tr key={processo.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs font-medium">
                  <Link
                    href={`/dashboard/processos/${processo.id}`}
                    className="hover:text-blue-700"
                  >
                    {formatCNJ(processo.numeroCnj)}
                  </Link>
                </td>
                <td className="px-4 py-3">{processo.reclamante}</td>
                <td className="px-4 py-3">
                  {processo.cliente.nomeFantasia ?? processo.cliente.razaoSocial}
                </td>
                <td className="px-4 py-3">{processo.tipoCalculo.nome}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(processo.status)}`}
                  >
                    {statusLabel(processo.status)}
                  </span>
                </td>
                <td className="px-4 py-3">{formatDate(processo.prazoInterno)}</td>
                <td className="px-4 py-3">{processo.executor?.nome ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {processos.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-500">
            Nenhum processo encontrado.
          </div>
        )}
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Página {page} de {totalPaginas}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`?q=${q}&status=${status ?? ""}&clienteId=${clienteId}&page=${page - 1}`}
                className="rounded-lg border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
              >
                Anterior
              </Link>
            )}
            {page < totalPaginas && (
              <Link
                href={`?q=${q}&status=${status ?? ""}&clienteId=${clienteId}&page=${page + 1}`}
                className="rounded-lg border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
              >
                Próxima
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
