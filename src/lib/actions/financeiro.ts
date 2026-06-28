"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autenticado.");
  return session;
}

export async function criarFatura(formData: FormData) {
  await requireSession();

  const clienteId  = String(formData.get("clienteId")  ?? "").trim();
  const competencia = String(formData.get("competencia") ?? "").trim();

  if (!clienteId || !competencia) throw new Error("Cliente e competência são obrigatórios.");

  const fatura = await prisma.fatura.create({
    data: { clienteId, competencia },
  });

  revalidatePath("/dashboard/financeiro");
  redirect(`/dashboard/financeiro/${fatura.id}`);
}

export async function adicionarItemFatura(faturaId: string, formData: FormData) {
  await requireSession();

  const processoId = String(formData.get("processoId") ?? "").trim();
  const valor      = parseFloat(String(formData.get("valor") ?? "0").replace(",", "."));
  const descricao  = String(formData.get("descricao") ?? "").trim() || null;

  if (!processoId || isNaN(valor) || valor <= 0) throw new Error("Dados inválidos.");

  await prisma.faturaItem.create({
    data: { faturaId, processoId, valor, descricao: descricao ?? "" },
  });

  revalidatePath(`/dashboard/financeiro/${faturaId}`);
}

export async function removerItemFatura(itemId: string, faturaId: string) {
  await requireSession();
  await prisma.faturaItem.delete({ where: { id: itemId } });
  revalidatePath(`/dashboard/financeiro/${faturaId}`);
}

export async function fecharFatura(faturaId: string) {
  await requireSession();

  const itens = await prisma.faturaItem.findMany({ where: { faturaId } });
  const total = itens.reduce((acc: number, i: any) => acc + Number(i.valor), 0);

  await prisma.fatura.update({
    where: { id: faturaId },
    data: { status: "FECHADA", valorTotal: total },
  });

  revalidatePath(`/dashboard/financeiro/${faturaId}`);
  revalidatePath("/dashboard/financeiro");
}

export async function reabrirFatura(faturaId: string) {
  await requireSession();
  await prisma.fatura.update({
    where: { id: faturaId },
    data: { status: "ABERTA" },
  });
  revalidatePath(`/dashboard/financeiro/${faturaId}`);
  revalidatePath("/dashboard/financeiro");
}

export async function marcarPaga(faturaId: string) {
  await requireSession();
  await prisma.fatura.update({
    where: { id: faturaId },
    data: { status: "PAGA" },
  });
  revalidatePath(`/dashboard/financeiro/${faturaId}`);
  revalidatePath("/dashboard/financeiro");
}

export async function cancelarFatura(faturaId: string) {
  await requireSession();
  await prisma.fatura.update({
    where: { id: faturaId },
    data: { status: "CANCELADA" },
  });
  revalidatePath(`/dashboard/financeiro/${faturaId}`);
  revalidatePath("/dashboard/financeiro");
}
