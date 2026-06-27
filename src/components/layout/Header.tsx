import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function Header() {
  const session = await getServerSession(authOptions);
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <div>
        <div className="text-sm text-gray-500">Sistema paralelo</div>
        <div className="font-semibold">Controle de produção de cálculos</div>
      </div>
      <div className="text-right text-sm">
        <div className="font-medium">{session?.user?.name}</div>
        <div className="text-gray-500">{(session?.user as any)?.role}</div>
      </div>
    </header>
  );
}
