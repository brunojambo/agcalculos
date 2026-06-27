"use client";
import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";

interface HeaderProps {
  user: { name?: string | null; email?: string | null; role?: string };
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div />
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-800">{user.name}</p>
          <p className="text-xs text-slate-400">{user.role}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 transition text-sm"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
