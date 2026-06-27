"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, StatusProcesso } from "@prisma/client";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

function parseDate(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  return raw ? new Date(`${raw}T12:00:00-03:00`) : null;
}

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Usuario nao autenticado.");
  return session.user.id;
}

function parseStatus(value: FormDataEntryValue | null) {
  const status = String(value ?? "");
  if (!Object.values(StatusProcesso).includes(status as StatusProcesso)) {
    throw new Error("Status invalido.");
  }
  return status as StatusProcesso;
}

export async function criarProcesso(formData: FormData) {
  const usuarioId = await requireUserId();
  const processoId = String(formData.get("processoId") ?? "").trim();
  const reclamante = String(formData.get("reclamante") ?? "").trim();
  const clienteId = String(formData.get("clienteId") ?? "").trim();
  const tipoCalculoId = String(formData.get("tipoCalculoId") ?? "").trim();

  if (!processoId) throw new Error("Identificador do formulario ausente.");
  if (!reclamante || !clienteId || !tipoCalculoId) {
    throw new Error("Reclamante, cliente e tipo de calculo sao obrigatorios.");
  }

  try {
    await prisma.$transaction(async (tx) => {
      const processo = await tx.processo.create({
        data: {
          id: processoId,
          numeroCnj: String(formData.get("numeroCnj") ?? "").trim() || null,
          reclamante,
          reclamada: String(formData.get("reclamada") ?? "").trim() || null,
          clienteId,
          tipoCalculoId,
          prazoInterno: parseDate(formData.get("prazoInterno")),
          prazoFatal: parseDate(formData.get("prazoFatal")),
          observacao: String(formData.get("observacao") ?? "").trim() || null
        }
      });

      await tx.movimentacao.create({
        data: {
          processoId: processo.id,
          usuarioId,
          statusAnterior: null,
          statusNovo: processo.status,
          observacao: "Processo cadastrado."
        }
      });
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
      throw error;
    }
  }

  revalidatePath("/dashboard/processos");
  redirect("/dashboard/processos");
}

export async function alterarStatus(processoId: string, formData: FormData) {
  const usuarioId = await requireUserId();
  const statusNovo = parseStatus(formData.get("status"));
  const observacao = String(formData.get("observacao") ?? "").trim() || null;

  const processo = await prisma.processo.findUniqueOrThrow({ where: { id: processoId } });

  await prisma.$transaction([
    prisma.processo.update({
      where: { id: processoId },
      data: {
        status: statusNovo,
        dataEntrega: statusNovo === "FINALIZADO" ? new Date() : processo.dataEntrega
      }
    }),
    prisma.movimentacao.create({
      data: {
        processoId,
        usuarioId,
        statusAnterior: processo.status,
        statusNovo,
        observacao
      }
    })
  ]);

  revalidatePath(`/dashboard/processos/${processoId}`);
  revalidatePath("/dashboard/processos");
}

export async function atribuirResponsaveis(processoId: string, formData: FormData) {
  await requireUserId();

  await prisma.processo.update({
    where: { id: processoId },
    data: {
      triadorId: String(formData.get("triadorId") ?? "") || null,
      digitadorId: String(formData.get("digitadorId") ?? "") || null,
      executorId: String(formData.get("executorId") ?? "") || null
    }
  });

  revalidatePath(`/dashboard/processos/${processoId}`);
  revalidatePath("/dashboard/processos");
}
