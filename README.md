# AG Cálculos Base

Base inicial para um sistema paralelo ao AG Cálculos atual, usando Next.js, Prisma, PostgreSQL/Supabase, NextAuth, Tailwind e deploy na Vercel.

## O que já vem pronto

- Login com e-mail e senha.
- Usuários com papel operacional.
- Cadastro de clientes.
- Cadastro de processos/cálculos.
- Fila de processos.
- Página de detalhe do processo.
- Alteração de status com histórico.
- Atribuição de triador, digitador e executor.
- Relatório básico de finalizados.
- Prisma schema preparado para financeiro futuro.

## Instalação local

```bash
npm install
cp .env.example .env.local
```

Preencha o `.env.local` com as URLs do Supabase e NextAuth.

Depois rode:

```bash
npm run db:push
npm run db:seed
npm run dev
```

Acesse:

```txt
http://localhost:3000
```

Usuário inicial:

```txt
E-mail: admin@agcalculos.com.br
Senha: admin123
```

Troque essa senha antes de produção.

## Variáveis de ambiente

```env
DATABASE_URL="postgresql://postgres.xxxxx:SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:SENHA@db.xxxxx.supabase.co:5432/postgres"
NEXTAUTH_SECRET="gere-uma-chave-grande"
NEXTAUTH_URL="http://localhost:3000"
```

Na Vercel, `NEXTAUTH_URL` deve ser o domínio de produção, por exemplo:

```txt
https://agcalculos.vercel.app
```

## Ordem recomendada de evolução

1. Estabilizar deploy e login.
2. Melhorar filtros da fila de processos.
3. Criar tela de usuários.
4. Criar módulo financeiro simples.
5. Criar exportação Excel dos finalizados.
6. Criar importação em lote.
7. Criar fila de qualidade e erros de elaboração.

## Observação importante

Esta base não é uma cópia completa do sistema atual. Ela é o núcleo operacional para evoluir com segurança.
