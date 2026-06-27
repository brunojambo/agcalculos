"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

export async function criarCliente(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Usuario nao autenticado.");

  const razaoSocial = String(formData.get("razaoSocial") ?? "").trim();
  if (!razaoSocial) throw new Error("Razao social e obrigatoria.");

  await prisma.cliente.create({
    data: {
      razaoSocial,
      nomeFantasia: String(formData.get("nomeFantasia") ?? "").trim() || null,
      cnpj: String(formData.get("cnpj") ?? "").trim() || null,
      cidade: String(formData.get("cidade") ?? "").trim() || null,
      uf: String(formData.get("uf") ?? "").trim().toUpperCase() || null
    }
  });

  revalidatePath("/dashboard/clientes");
  redirect("/dashboard/clientes");
}
