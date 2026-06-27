import { listarProcessos } from "@/lib/actions/processos";
import { ProcessosTable } from "@/components/processos/ProcessosTable";
import { ProcessosFiltros } from "@/components/processos/ProcessosFiltros";
import { Plus } from "lucide-react";
import Link from "next/link";

interface SearchParams {
  status?: string;
  search?: string;
  page?: string;
}

export default async function ProcessosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { processos, total } = await listarProcessos({
    status:    searchParams.status as any,
    search:    searchParams.search,
    page:      searchParams.page ? Number(searchParams.page) : 1,
  });

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Processos</h1>
          <p className="text-sm text-slate-400">{total} processo{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/dashboard/processos/novo"
          className="flex items-center gap-2 bg-brand-navy text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 transition"
        >
          <Plus className="w-4 h-4" />
          Novo processo
        </Link>
      </div>

      {/* Filtros */}
      <ProcessosFiltros />

      {/* Tabela */}
      <ProcessosTable processos={processos as any} />
    </div>
  );
}
