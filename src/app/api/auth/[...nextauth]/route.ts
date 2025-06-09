// src/app/api/auth/[...nextauth]/route.ts

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/prisma/prisma";
import { compare } from "bcrypt";

/**
 * Configuração das opções do NextAuth para autenticação
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) {
          return null;
        }

        // Busca o usuário pelo email
        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email },
        });

        // Verifica se o usuário existe e se a senha está correta
        if (!usuario || !usuario.senha) {
          return null;
        }

        // Compara a senha fornecida com a senha armazenada
        const senhaCorreta = await compare(credentials.senha, usuario.senha);

        if (!senhaCorreta) {
          return null;
        }

        // Retorna os dados do usuário sem a senha
        return {
          id: usuario.id,
          name: usuario.nome,
          email: usuario.email,
          image: usuario.imagem,
          cargo: usuario.cargo,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Adiciona dados personalizados ao token JWT
      if (user) {
        token.id = user.id;
        token.cargo = user.cargo;
      }
      return token;
    },
    async session({ session, token }) {
      // Adiciona dados personalizados à sessão
      if (token) {
        session.user.id = token.id as string;
        session.user.cargo = token.cargo as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Manipulador de rotas do NextAuth
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };