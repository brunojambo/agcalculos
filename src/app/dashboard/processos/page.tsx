import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { formatDate, statusClass, statusLabel } from "@/lib/utils/format";
import { formatCNJ } from "@/lib/utils/cnj";
import { ProcessosFiltros } from "@/components/processos/ProcessosFiltros";

export const dynamic = "force-dynamic";

const POR_PAGINA = 100;

type OrdemCampo = "prazoInterno" | "reclamante" | "status" | "createdAt";
type OrdemDir   = "asc" | "desc";

interface Props {
  searchParams: {
    q?: string; status?: string; clienteId?: string;
    page?: string; ordem?: string; dir?: string;
  };
}

export default async function ProcessosPage({ searchParams }: Props) {
  const q         = searchParams.q?.trim() ?? "";
  const status    = searchParams.status ?? "";
  const clienteId = searchParams.clienteId ?? "";
  const page      = Math.max(1, Number(searchParams.page ?? 1));
  const skip      = (page - 1) * POR_PAGINA;
  const ordem     = (searchParams.ordem ?? "prazoInterno") as OrdemCampo;
  const dir       = (searchParams.dir ?? "asc") as OrdemDir;
  const hoje      = new Date(); hoje.setHours(0, 0, 0, 0);

  const where: any = {
    ...(status    ? { status }    : {}),
    ...(clienteId ? { clienteId } : {}),
    ...(q ? { OR: [
      { numeroCnj:  { contains: q, mode: "insensitive" } },
      { reclamante: { contains: q, mode: "insensitive" } },
    ]} : {}),
  };

  const orderBy: any = ordem === "prazoInterno"
    ? [{ prazoInterno: dir }, { createdAt: "desc" }]
    : [{ [ordem]: dir }];

  const [processos, total, clientes] = await Promise.all([
    prisma.processo.findMany({
      where, orderBy,
      include: { cliente: true, tipoCalculo: true, executor: true },
      skip, take: POR_PAGINA,
    }),
    prisma.processo.count({ where }),
    prisma.cliente.findMany({
      where: { ativo: true }, orderBy: { razaoSocial: "asc" },
      select: { id: true, razaoSocial: true, nomeFantasia: true },
    }),
  ]);

  const totalPaginas = Math.ceil(total / POR_PAGINA);

  function thLink(campo: OrdemCampo, label: string) {
    const novaDir = ordem === campo && dir === "asc" ? "desc" : "asc";
    const params = new URLSearchParams({ q, status, clienteId, ordem: campo, dir: novaDir });
    return (
      <th className="px-4 py-3">
        <Link href={`/dashboard/processos?${params}`}
          className="flex items-center gap-1 hover:text-blue-700 whitespace-nowrap">
          {label}
          {ordem === campo && <span className="text-blue-600">{dir === "asc" ? "↑" : "↓"}</span>}
        </Link>
      </th>
    );
  }

  function paginaLink(p: number) {
    const params = new URLSearchParams({ q, status, clienteId, ordem, dir, page: String(p) });
    return `/dashboard/processos?${params}`;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Processos</h1>
          <p className="text-sm text-gray-500">
            {total} processo{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/dashboard/processos/novo"
          className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
          + Novo processo
        </Link>
      </div>

      <ProcessosFiltros clientes={clientes} />

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">CNJ</th>
              {thLink("reclamante", "Reclamante")}
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Tipo</th>
              {thLink("status", "Status")}
              {thLink("prazoInterno", "Prazo")}
              <th className="px-4 py-3">Executor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {processos.map((p: any) => {
              const vencido = p.prazoInterno && new Date(p.prazoInterno) < hoje
                && !["FINALIZADO","CANCELADO"].includes(p.status);
              return (
                <tr key={p.id}
                  className={`hover:bg-gray-50 ${vencido ? "bg-red-50 hover:bg-red-100" : ""}`}>
                  <td className="px-4 py-3 font-mono text-xs font-medium">
                    <Link href={`/dashboard/processos/${p.id}`} className="hover:text-blue-700">
                      {p.numeroCnj ? formatCNJ(p.numeroCnj) : <span className="text-gray-400 italic">sem CNJ</span>}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium max-w-[200px] truncate">
                    <Link href={`/dashboard/processos/${p.id}`} className="hover:text-blue-700">
                      {p.reclamante}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">
                    {p.cliente.nomeFantasia ?? p.cliente.razaoSocial}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">
                    {p.tipoCalculo.nome}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(p.status)}`}>
                      {statusLabel(p.status)}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium ${vencido ? "text-red-600" : "text-gray-600"}`}>
                    {formatDate(p.prazoInterno)}
                    {vencido && <span className="ml-1 text-xs">⚠</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.executor?.nome ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {processos.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-500">Nenhum processo encontrado.</div>
        )}
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Página {page} de {totalPaginas}</span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={paginaLink(page - 1)}
                className="rounded-xl border border-gray-300 px-3 py-1.5 hover:bg-gray-50">
                ← Anterior
              </Link>
            )}
            {page < totalPaginas && (
              <Link href={paginaLink(page + 1)}
                className="rounded-xl border border-gray-300 px-3 py-1.5 hover:bg-gray-50">
                Próxima →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
