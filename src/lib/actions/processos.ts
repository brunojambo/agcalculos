"use server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { StatusProcesso } from "@prisma/client";
import { z } from "zod";

const processoSchema = z.object({
  numeroCNJ:      z.string().min(20, "CNJ inválido"),
  reclamante:     z.string().min(2),
  empresaId:      z.string(),
  tipoCalculoId:  z.string().optional(),
  prazo:          z.string().optional(),
  codigoInterno:  z.string().optional(),
  observacoes:    z.string().optional(),
});

export async function criarProcesso(data: z.infer<typeof processoSchema>) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const parsed = processoSchema.parse(data);

  const processo = await prisma.processo.create({
    data: {
      ...parsed,
      prazo: parsed.prazo ? new Date(parsed.prazo) : null,
      historicos: {
        create: {
          statusNovo: "DISPONIVEL",
          usuarioId: (session.user as any).id,
          observacao: "Processo criado",
        },
      },
    },
  });

  revalidatePath("/dashboard/processos");
  return processo;
}

export async function atualizarStatus(
  processoId: string,
  novoStatus: StatusProcesso,
  observacao?: string
) {
  const session = await auth();
  if (!session) throw new Error("Não autorizado");

  const processo = await prisma.processo.findUniqueOrThrow({
    where: { id: processoId },
  });

  await prisma.$transaction([
    prisma.processo.update({
      where: { id: processoId },
      data: { status: novoStatus },
    }),
    prisma.historicoStatus.create({
      data: {
        processoId,
        statusAnterior: processo.status,
        statusNovo: novoStatus,
        usuarioId: (session.user as any).id,
        observacao,
      },
    }),
  ]);

  revalidatePath("/dashboard/processos");
}

export async function listarProcessos(filtros?: {
  status?: StatusProcesso;
  empresaId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page  = filtros?.page  ?? 1;
  const limit = filtros?.limit ?? 100;

  const where: any = {};
  if (filtros?.status)    where.status    = filtros.status;
  if (filtros?.empresaId) where.empresaId = filtros.empresaId;
  if (filtros?.search) {
    where.OR = [
      { numeroCNJ:  { contains: filtros.search, mode: "insensitive" } },
      { reclamante: { contains: filtros.search, mode: "insensitive" } },
    ];
  }

  const [processos, total] = await prisma.$transaction([
    prisma.processo.findMany({
      where,
      include: {
        empresa:     { include: { grupo: true } },
        tipoCalculo: true,
        triador:     { select: { id: true, nome: true } },
        digitador:   { select: { id: true, nome: true } },
        executor:    { select: { id: true, nome: true } },
      },
      orderBy: { prazo: "asc" },
      skip:  (page - 1) * limit,
      take:  limit,
    }),
    prisma.processo.count({ where }),
  ]);

  return { processos, total, page, limit };
}
