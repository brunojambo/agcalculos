export const dynamic = "force-dynamic";

import Link from "next/link";
import { Calculator, Users } from "lucide-react";

const modulos = [
  {
    href: "/dashboard/cadastro/tipos-calculo",
    icon: Calculator,
    label: "Tipos de cálculo",
    desc: "Categorias usadas nos processos",
  },
  {
    href: "/dashboard/cadastro/usuarios",
    icon: Users,
    label: "Usuários",
    desc: "Triadores, digitadores, executores e admins",
  },
];

export default function CadastroPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Cadastro</h1>
        <p className="text-sm text-gray-500">Tabelas base do sistema.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {modulos.map((m: any) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.href}
              href={m.href}
              className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 hover:ring-blue-300 transition-all"
            >
              <div className="rounded-xl bg-blue-50 p-3">
                <Icon size={22} className="text-blue-700" />
              </div>
              <div>
                <p className="font-semibold">{m.label}</p>
                <p className="text-sm text-gray-500">{m.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
