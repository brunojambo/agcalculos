import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash("admin123", 10);

  await prisma.usuario.upsert({
    where: { email: "admin@agcalculos.com.br" },
    update: {
      nome: "Administrador",
      senhaHash,
      role: Role.ADMIN,
      ativo: true
    },
    create: {
      nome: "Administrador",
      email: "admin@agcalculos.com.br",
      senhaHash,
      role: Role.ADMIN
    }
  });

  const tipos = [
    "Cálculo inicial",
    "Liquidação",
    "Impugnação",
    "Parecer técnico",
    "Valores para acordo",
    "eSocial",
    "Coletivo"
  ];

  for (const nome of tipos) {
    await prisma.tipoCalculo.upsert({
      where: { nome },
      update: {},
      create: { nome }
    });
  }

  const cliente = await prisma.cliente.upsert({
    where: { id: "cliente-demo-ag" },
    update: {},
    create: {
      id: "cliente-demo-ag",
      razaoSocial: "Cliente Demonstração",
      nomeFantasia: "Escritório Modelo",
      cidade: "São Sebastião",
      uf: "SP"
    }
  });

  const tipo = await prisma.tipoCalculo.findFirstOrThrow();
  await prisma.processo.upsert({
    where: { id: "processo-demo-ag" },
    update: {},
    create: {
      id: "processo-demo-ag",
      reclamante: "Processo exemplo",
      reclamada: "Empresa exemplo",
      numeroCnj: "0000000-00.2026.5.00.0000",
      clienteId: cliente.id,
      tipoCalculoId: tipo.id,
      observacao: "Registro criado para validar a tela inicial."
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
