"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

export async function criarCliente(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Usuario nao autenticado.");

  const clienteId = String(formData.get("clienteId") ?? "").trim();
  const razaoSocial = String(formData.get("razaoSocial") ?? "").trim();
  if (!clienteId) throw new Error("Identificador do formulario ausente.");
  if (!razaoSocial) throw new Error("Razao social e obrigatoria.");

  const data = {
    razaoSocial,
    nomeFantasia: String(formData.get("nomeFantasia") ?? "").trim() || null,
    cnpj: String(formData.get("cnpj") ?? "").trim() || null,
    cidade: String(formData.get("cidade") ?? "").trim() || null,
    uf: String(formData.get("uf") ?? "").trim().toUpperCase() || null
  };

  await prisma.cliente.upsert({
    where: { id: clienteId },
    update: data,
    create: {
      id: clienteId,
      ...data
    }
  });

  revalidatePath("/dashboard/clientes");
  redirect("/dashboard/clientes");
}
