import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");

  // Usuário admin
  const senhaHash = await bcrypt.hash("admin123", 10);
  await prisma.usuario.upsert({
    where: { email: "bruno@agcalculos.com.br" },
    update: {},
    create: {
      nome:  "Bruno Guimarães",
      email: "bruno@agcalculos.com.br",
      senha: senhaHash,
      role:  "ADMIN",
    },
  });

  // Grupos
  const grupos = ["HAPVIDA", "INDEPENDENTE"];
  for (const nome of grupos) {
    await prisma.grupo.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
  }

  // Tipos de cálculo
  const tipos = [
    { codigo: "01", descricao: "IMPUGNAÇÃO AOS CÁLCULOS" },
    { codigo: "02", descricao: "LIQUIDAÇÃO DE SENTENÇA" },
    { codigo: "03", descricao: "PARECER TÉCNICO" },
    { codigo: "04", descricao: "CONFERÊNCIA PARA ACORDO" },
    { codigo: "05", descricao: "APRESENTAÇÃO DOS CÁLCULOS (ART. 879 CLT) - EXECUÇÃO" },
    { codigo: "10", descricao: "E-SOCIAL - S2500 - SEM RECOLHIMENTO INSS/IRPF/FGTS" },
    { codigo: "11", descricao: "E-SOCIAL - S2501 - INCIDÊNCIA INSS/IRPF/FGTS" },
    { codigo: "12", descricao: "FGTS DIGITAL (LANÇAR S2500)" },
  ];
  for (const t of tipos) {
    await prisma.tipoCalculo.upsert({
      where: { codigo: t.codigo },
      update: {},
      create: t,
    });
  }

  // Parâmetros base
  await prisma.parametro.upsert({
    where: { chave: "FUSO_HORARIO" },
    update: {},
    create: { chave: "FUSO_HORARIO", valor: "America/Sao_Paulo" },
  });

  console.log("Seed concluído.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
