"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, Building2, BarChart3, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const items = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/processos", label: "Processos", icon: Calculator },
  { href: "/dashboard/clientes", label: "Clientes", icon: Building2 },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/dashboard/cadastro", label: "Cadastro", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-64 border-r border-gray-200 bg-white p-5 md:block">
      <div className="mb-8">
        <div className="text-lg font-bold">AG Cálculos</div>
        <div className="text-xs text-gray-500">Base operacional v1</div>
      </div>
      <nav className="space-y-1">
        {items.map((item: any) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : (pathname?.startsWith(item.href) ?? false);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
