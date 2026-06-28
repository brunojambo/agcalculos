import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login" },
  providers: [
    CredentialsProvider({
      name: "E-mail e senha",
      credentials: {
        email:    { label: "E-mail", type: "email" },
        password: { label: "Senha",  type: "password" },
      },
      async authorize(credentials) {
        const email    = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;
        if (!email || !password) return null;

        // Lazy import — evita instanciar PrismaClient no módulo raiz
        const { prisma } = await import("@/lib/db/prisma");

        const usuario = await prisma.usuario.findUnique({ where: { email } });
        if (!usuario || !usuario.ativo) return null;

        const senhaOk = await bcrypt.compare(password, usuario.senhaHash);
        if (!senhaOk) return null;

        return {
          id:    usuario.id,
          name:  usuario.nome,
          email: usuario.email,
          role:  usuario.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id   = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};
