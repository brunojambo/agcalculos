import { prisma } from "@/lib/db/prisma";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { criarUsuario, toggleAtivoUsuario } from "@/lib/actions/cadastro";

export const dynamic = "force-dynamic";

const ROLES = [
  { value: "ADMIN", label: "Admin" },
  { value: "GESTOR", label: "Gestor" },
  { value: "TRIADOR", label: "Triador" },
  { value: "DIGITADOR", label: "Digitador" },
  { value: "EXECUTOR", label: "Executor" },
  { value: "QUALIDADE", label: "Qualidade" },
  { value: "FINANCEIRO", label: "Financeiro" },
];

const roleBadge: Record<string, string> = {
  ADMIN:      "bg-purple-100 text-purple-800",
  GESTOR:     "bg-blue-100 text-blue-800",
  TRIADOR:    "bg-cyan-100 text-cyan-800",
  DIGITADOR:  "bg-yellow-100 text-yellow-800",
  EXECUTOR:   "bg-orange-100 text-orange-800",
  QUALIDADE:  "bg-green-100 text-green-800",
  FINANCEIRO: "bg-pink-100 text-pink-800",
};

export default async function UsuariosPage() {
  const usuarios = await prisma.usuario.findMany({
    orderBy: [{ ativo: "desc" }, { nome: "asc" }],
    include: {
      _count: {
        select: {
          processosTriagem: true,
          processosDigitacao: true,
          processosExecucao: true,
        },
      },
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Usuários</h1>
        <p className="text-sm text-gray-500">{usuarios.length} usuário{usuarios.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Cadastro de usuário */}
      <form action={criarUsuario} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 space-y-4">
        <p className="text-sm font-semibold">Novo usuário</p>
        <div className="grid gap-4 md:grid-cols-2">
          <input name="nome" required placeholder="Nome completo *"
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input name="email" type="email" required placeholder="E-mail *"
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input name="senha" type="password" required placeholder="Senha *" minLength={6}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select name="role" defaultValue="EXECUTOR"
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {ROLES.map((r: any) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
        <SubmitButton pendingLabel="Cadastrando..." className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
          Cadastrar usuário
        </SubmitButton>
      </form>

      {/* Tabela */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Processos</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {usuarios.map((u: any) => {
              const totalProcessos = u._count.processosTriagem + u._count.processosDigitacao + u._count.processosExecucao;
              return (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.nome}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${roleBadge[u.role] ?? "bg-gray-100 text-gray-800"}`}>
                      {ROLES.find((r) => r.value === u.role)?.label ?? u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{totalProcessos}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.ativo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {u.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleAtivoUsuario.bind(null, u.id)}>
                      <button type="submit" className="text-xs text-gray-400 hover:text-gray-700">
                        {u.ativo ? "Desativar" : "Reativar"}
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
