import { criarCliente } from "@/lib/actions/clientes";

export default function NovoClientePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Novo cliente</h1>
        <p className="text-sm text-gray-500">Cadastro inicial de escritório/empresa.</p>
      </div>

      <form action={criarCliente} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <label className="block text-sm font-medium">Razão social
          <input name="razaoSocial" required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
        </label>
        <label className="block text-sm font-medium">Nome fantasia
          <input name="nomeFantasia" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
        </label>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm font-medium md:col-span-2">CNPJ
            <input name="cnpj" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium">UF
            <input name="uf" maxLength={2} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
        </div>
        <label className="block text-sm font-medium">Cidade
          <input name="cidade" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
        </label>
        <button className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">Cadastrar cliente</button>
      </form>
    </div>
  );
}
