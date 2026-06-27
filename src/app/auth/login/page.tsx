import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="mb-8 text-center">
          <div className="text-brand-gold text-3xl font-bold tracking-tight">AG Cálculos</div>
          <p className="text-slate-400 text-sm mt-1">Sistema de Gestão v2</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
