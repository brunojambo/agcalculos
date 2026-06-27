import type { Role, StatusProcesso, StatusFatura } from "@prisma/client";

export type { Role, StatusProcesso, StatusFatura };

export interface ProcessoComRelacoes {
  id: string;
  numeroCNJ: string;
  reclamante: string;
  status: StatusProcesso;
  prazo: Date | null;
  codigoInterno: string | null;
  createdAt: Date;
  empresa: { id: string; razaoSocial: string; grupo?: { nome: string } | null };
  tipoCalculo: { codigo: string; descricao: string } | null;
  triador: { id: string; nome: string } | null;
  digitador: { id: string; nome: string } | null;
  executor: { id: string; nome: string } | null;
}

export interface UsuarioSession {
  id: string;
  nome: string;
  email: string;
  role: Role;
}
