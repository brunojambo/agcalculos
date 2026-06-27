"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";


async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autenticado.");
  const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id: session.user.id } });
  if (usuario.role !== "ADMIN" && usuario.role !== "GESTOR") throw new Error("Sem permissão.");
  return session;
}

// ── Tipos de cálculo ─────────────────────────────────────────────

export async function criarTipoCalculo(formData: FormData) {
  await requireAdmin();

  const nome = String(formData.get("nome") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim() || null;
  if (!nome) throw new Error("Nome é obrigatório.");

  await prisma.tipoCalculo.create({ data: { nome, descricao } });
  revalidatePath("/dashboard/cadastro/tipos-calculo");
}

export async function toggleAtivoTipoCalculo(tipoId: string) {
  await requireAdmin();
  const tipo = await prisma.tipoCalculo.findUniqueOrThrow({ where: { id: tipoId } });
  await prisma.tipoCalculo.update({ where: { id: tipoId }, data: { ativo: !tipo.ativo } });
  revalidatePath("/dashboard/cadastro/tipos-calculo");
}

// ── Usuários ─────────────────────────────────────────────────────

export async function criarUsuario(formData: FormData) {
  await requireAdmin();

  const nome  = String(formData.get("nome")  ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const senha = String(formData.get("senha") ?? "").trim();
  const role = String(formData.get("role") ?? "EXECUTOR");

  if (!nome || !email || !senha) throw new Error("Nome, e-mail e senha são obrigatórios.");
  if (senha.length < 6) throw new Error("Senha deve ter pelo menos 6 caracteres.");

  const senhaHash = await bcrypt.hash(senha, 10);

  await prisma.usuario.create({
    data: { nome, email, senhaHash, role },
  });

  revalidatePath("/dashboard/cadastro/usuarios");
}

export async function toggleAtivoUsuario(usuarioId: string) {
  await requireAdmin();
  const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId } });
  await prisma.usuario.update({ where: { id: usuarioId }, data: { ativo: !usuario.ativo } });
  revalidatePath("/dashboard/cadastro/usuarios");
}
