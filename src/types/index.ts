export type Role = "ADMIN" | "GESTOR" | "TRIADOR" | "DIGITADOR" | "EXECUTOR" | "QUALIDADE" | "FINANCEIRO" | "CLIENTE";

export type StatusProcesso =
  | "NOVO" | "TRIAGEM" | "DIGITACAO" | "ELABORACAO" | "REVISAO"
  | "QUALIDADE" | "AGUARDANDO_CLIENTE" | "FINALIZADO" | "CANCELADO";

export type StatusFatura = "ABERTA" | "FECHADA" | "PAGA" | "CANCELADA";
