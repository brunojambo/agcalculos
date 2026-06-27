import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { authOptions } from "@/lib/auth/options";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
