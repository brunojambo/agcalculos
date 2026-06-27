"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FileText, Users, DollarSign,
  BarChart2, Settings, Building2, ChevronRight
} from "lucide-react";

const NAV = [
  {
    label: "Processos",
    href: "/dashboard/processos",
    icon: FileText,
    desc: "Arquimedes",
  },
  {
    label: "Clientes",
    href: "/dashboard/clientes",
    icon: Building2,
    desc: "Kronos",
  },
  {
    label: "Financeiro",
    href: "/dashboard/financeiro",
    icon: DollarSign,
    desc: "Faturas e metas",
  },
  {
    label: "Relatórios",
    href: "/dashboard/relatorios",
    icon: BarChart2,
    desc: "",
  },
  {
    label: "Gestão",
    href: "/dashboard/gestao",
    icon: LayoutDashboard,
    desc: "",
  },
  {
    label: "Cadastro",
    href: "/dashboard/cadastro",
    icon: Settings,
    desc: "Tabelas base",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-brand-navy flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <span className="text-brand-gold font-bold text-lg tracking-wide">AG Cálculos</span>
        <span className="text-white/30 text-xs ml-2 font-mono">v2</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors group",
                active
                  ? "bg-brand-gold/20 text-brand-gold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium">{item.label}</div>
                {item.desc && (
                  <div className="text-xs opacity-50 truncate">{item.desc}</div>
                )}
              </div>
              {active && <ChevronRight className="w-3 h-3 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10">
        <p className="text-white/20 text-xs">© AG Cálculos 2025</p>
      </div>
    </aside>
  );
}
