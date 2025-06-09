// src/middleware.ts

import { NextRequest } from "next/server";
import { autenticarRota } from "./middlewares/auth";

/**
 * Middleware global da aplicação
 * Aplica o middleware de autenticação em todas as rotas
 */
export async function middleware(req: NextRequest) {
  return autenticarRota(req);
}

/**
 * Configuração de quais rotas o middleware deve ser aplicado
 */
export const config = {
  // Aplica o middleware em todas as rotas exceto as estáticas
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"]
};