import Link from "next/link";
import { Calculator, Building2, BarChart3, LayoutDashboard } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/dashboard/processos", label: "Processos", icon: Calculator },
  { href: "/dashboard/clientes", label: "Clientes", icon: Building2 },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: BarChart3 }
];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 border-r border-gray-200 bg-white p-5 md:block">
      <div className="mb-8">
        <div className="text-lg font-bold">AG Cálculos</div>
        <div className="text-xs text-gray-500">Base operacional v1</div>
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
