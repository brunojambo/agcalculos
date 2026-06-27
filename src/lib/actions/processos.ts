"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { StatusProcesso } from "@prisma/client";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

function parseDate(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  return raw ? new Date(`${raw}T12:00:00-03:00`) : null;
}

export async function criarProcesso(formData: FormData) {
  const reclamante = String(formData.get("reclamante") ?? "").trim();
  const clienteId = String(formData.get("clienteId") ?? "").trim();
  const tipoCalculoId = String(formData.get("tipoCalculoId") ?? "").trim();

  if (!reclamante || !clienteId || !tipoCalculoId) {
    throw new Error("Reclamante, cliente e tipo de cálculo são obrigatórios.");
  }

  await prisma.processo.create({
    data: {
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

  revalidatePath("/dashboard/processos");
  redirect("/dashboard/processos");
}

export async function alterarStatus(processoId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Usuário não autenticado.");

  const statusNovo = String(formData.get("status") ?? "") as StatusProcesso;
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
        usuarioId: session.user.id,
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
