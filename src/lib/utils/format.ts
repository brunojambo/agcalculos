export function formatDate(value?: Date | string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" }).format(new Date(value));
}

export function formatCurrency(value?: number | string | null) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value));
}

export function statusLabel(status: string) {
  const map: Record<string, string> = {
    NOVO: "Novo",
    TRIAGEM: "Triagem",
    DIGITACAO: "Digitação",
    ELABORACAO: "Elaboração",
    REVISAO: "Revisão",
    QUALIDADE: "Qualidade",
    AGUARDANDO_CLIENTE: "Aguardando cliente",
    FINALIZADO: "Finalizado",
    CANCELADO: "Cancelado"
  };
  return map[status] ?? status;
}

export function statusClass(status: string) {
  if (status === "FINALIZADO") return "bg-green-100 text-green-800";
  if (status === "CANCELADO") return "bg-red-100 text-red-800";
  if (status === "AGUARDANDO_CLIENTE") return "bg-yellow-100 text-yellow-800";
  return "bg-blue-100 text-blue-800";
}
