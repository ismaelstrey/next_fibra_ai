// src/middlewares/auth.ts

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Middleware de autenticação para proteger rotas
 * @param req - Requisição Next.js
 * @returns Resposta Next.js ou undefined para continuar
 */
export async function autenticarRota(req: NextRequest) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const caminhoAtual = req.nextUrl.pathname;

  // Lista de rotas públicas que não requerem autenticação
  const rotasPublicas = ["/login", "/registro", "/recuperar-senha"];
  const ehRotaPublica = rotasPublicas.some((rota) => caminhoAtual.startsWith(rota));

  // Lista de rotas de API que não requerem autenticação
  const rotasApiPublicas = ["/api/auth","/api/registro"];
  const ehRotaApiPublica = rotasApiPublicas.some((rota) => caminhoAtual.startsWith(rota));

  // Se for uma rota pública ou de API pública, permite o acesso
  if (ehRotaPublica || ehRotaApiPublica) {
    return NextResponse.next();
  }

  // Se não estiver autenticado e não for uma rota pública, redireciona para o login
  if (!session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", encodeURI(caminhoAtual));
    return NextResponse.redirect(url);
  }

  // Verifica permissões baseadas no cargo do usuário (opcional)
  const cargo = session.cargo as string;
  const rotasAdmin = ["/admin"];
  const ehRotaAdmin = rotasAdmin.some((rota) => caminhoAtual.startsWith(rota));

  // Se for uma rota de admin e o usuário não for admin, redireciona para a página inicial
  if (ehRotaAdmin && cargo !== "Gerente") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Permite o acesso se todas as verificações passarem
  return NextResponse.next();
}