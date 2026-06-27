import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formata número CNJ: NNNNNNN-DD.AAAA.J.TT.OOOO */
export function formatCNJ(cnj: string): string {
  const digits = cnj.replace(/\D/g, "");
  if (digits.length !== 20) return cnj;
  return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13, 14)}.${digits.slice(14, 16)}.${digits.slice(16)}`;
}

/** Extrai TRT do número CNJ (posição J.TT) */
export function extrairTRT(cnj: string): string | null {
  const digits = cnj.replace(/\D/g, "");
  if (digits.length !== 20) return null;
  return digits.slice(14, 16); // código TRT
}

/** Status → label pt-BR */
export const STATUS_LABELS: Record<string, string> = {
  DISPONIVEL:  "Disponível",
  TRIAGEM:     "Triagem",
  DIGITACAO:   "Digitação",
  REVISAO:     "Revisão",
  APROVACAO:   "Aprovação",
  CONCLUIDO:   "Concluído",
  CANCELADO:   "Cancelado",
  AGUARDANDO:  "Aguardando",
};

/** Status → cor Tailwind */
export const STATUS_COLORS: Record<string, string> = {
  DISPONIVEL:  "bg-emerald-100 text-emerald-800",
  TRIAGEM:     "bg-blue-100 text-blue-800",
  DIGITACAO:   "bg-violet-100 text-violet-800",
  REVISAO:     "bg-amber-100 text-amber-800",
  APROVACAO:   "bg-orange-100 text-orange-800",
  CONCLUIDO:   "bg-slate-100 text-slate-700",
  CANCELADO:   "bg-red-100 text-red-800",
  AGUARDANDO:  "bg-yellow-100 text-yellow-800",
};

/** Dias úteis — verifica se data é dia útil (sem feriados por ora) */
export function isDiaUtil(data: Date): boolean {
  const dia = data.getDay();
  return dia !== 0 && dia !== 6;
}

/** Adiciona N dias úteis a uma data */
export function adicionarDiasUteis(data: Date, dias: number): Date {
  let resultado = new Date(data);
  let adicionados = 0;
  while (adicionados < dias) {
    resultado.setDate(resultado.getDate() + 1);
    if (isDiaUtil(resultado)) adicionados++;
  }
  return resultado;
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(date));
}

export function formatCurrency(value: number | string): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL",
  }).format(Number(value));
}
