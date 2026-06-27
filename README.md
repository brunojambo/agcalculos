# AG Cálculos v2

Sistema de gestão de cálculos judiciais trabalhistas — stack moderna.

## Stack
- **Next.js 14** (App Router + Server Actions)
- **PostgreSQL** via Supabase
- **Prisma** ORM
- **NextAuth v5** (JWT + Credentials)
- **Tailwind CSS** + shadcn/ui
- **Vercel** (deploy)

## Setup local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis
cp .env.example .env.local
# Preencher DATABASE_URL e NEXTAUTH_SECRET

# 3. Gerar Prisma Client
npm run db:generate

# 4. Criar tabelas
npm run db:push

# 5. Seed inicial
npm run db:seed

# 6. Rodar dev
npm run dev
```

## Módulos
- `/dashboard/processos` — Gestão de cálculos (equivalente Arquimedes)
- `/dashboard/clientes`  — CRM de escritórios (equivalente Kronos)
- `/dashboard/financeiro` — Faturas, metas, planejamento
- `/dashboard/relatorios` — Relatórios e exportação Excel
- `/dashboard/gestao`    — KPIs, avaliações, projeto moro
- `/dashboard/cadastro`  — Tabelas base (tipos, grupos, eventos)

## Roles
| Role      | Acesso |
|-----------|--------|
| ADMIN     | Total |
| GESTOR    | Gestão + relatórios |
| TRIADOR   | Triagem de processos |
| DIGITADOR | Digitação |
| EXECUTOR  | Execução de cálculos |
