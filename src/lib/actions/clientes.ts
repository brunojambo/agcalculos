"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

export async function criarCliente(formData: FormData) {
  const razaoSocial = String(formData.get("razaoSocial") ?? "").trim();
  if (!razaoSocial) throw new Error("Razão social é obrigatória.");

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
