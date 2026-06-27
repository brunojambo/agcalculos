"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Usuário não autenticado.");
  return session;
}

function parseCliente(formData: FormData) {
  return {
    razaoSocial: String(formData.get("razaoSocial") ?? "").trim(),
    nomeFantasia: String(formData.get("nomeFantasia") ?? "").trim() || null,
    cnpj: String(formData.get("cnpj") ?? "").trim() || null,
    cidade: String(formData.get("cidade") ?? "").trim() || null,
    uf: String(formData.get("uf") ?? "").trim().toUpperCase() || null,
  };
}

export async function criarCliente(formData: FormData) {
  await requireSession();

  const clienteId = String(formData.get("clienteId") ?? "").trim();
  const data = parseCliente(formData);
  if (!clienteId) throw new Error("Identificador ausente.");
  if (!data.razaoSocial) throw new Error("Razão social é obrigatória.");

  await prisma.cliente.upsert({
    where: { id: clienteId },
    update: data,
    create: { id: clienteId, ...data },
  });

  revalidatePath("/dashboard/clientes");
  redirect("/dashboard/clientes");
}

export async function editarCliente(clienteId: string, formData: FormData) {
  await requireSession();
  const data = parseCliente(formData);
  if (!data.razaoSocial) throw new Error("Razão social é obrigatória.");

  await prisma.cliente.update({ where: { id: clienteId }, data });

  revalidatePath(`/dashboard/clientes/${clienteId}`);
  revalidatePath("/dashboard/clientes");
}

export async function toggleAtivoCliente(clienteId: string) {
  await requireSession();

  const cliente = await prisma.cliente.findUniqueOrThrow({ where: { id: clienteId } });
  await prisma.cliente.update({
    where: { id: clienteId },
    data: { ativo: !cliente.ativo },
  });

  revalidatePath(`/dashboard/clientes/${clienteId}`);
  revalidatePath("/dashboard/clientes");
}

export async function adicionarContato(clienteId: string, formData: FormData) {
  await requireSession();

  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) throw new Error("Nome do contato é obrigatório.");

  await prisma.contatoCliente.create({
    data: {
      clienteId,
      nome,
      cargo: String(formData.get("cargo") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      telefone: String(formData.get("telefone") ?? "").trim() || null,
    },
  });

  revalidatePath(`/dashboard/clientes/${clienteId}`);
}

export async function removerContato(contatoId: string, clienteId: string) {
  await requireSession();

  await prisma.contatoCliente.delete({ where: { id: contatoId } });
  revalidatePath(`/dashboard/clientes/${clienteId}`);
}
