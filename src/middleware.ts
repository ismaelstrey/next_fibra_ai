// src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { autenticarRota } from "./middlewares/auth";
import { adicionarCabecalhosSeguranca, configurarCORS, prevenirCSRF } from "./middlewares/seguranca";

/**
 * Middleware principal do Next.js
 * Executa em todas as requisições antes de chegar às rotas
 */
export async function middleware(request: NextRequest) {
  // Adiciona cabeçalhos de segurança
  const responseSeguranca = adicionarCabecalhosSeguranca(request);
  if (responseSeguranca.status !== 200) {
    return responseSeguranca;
  }

  // Configura CORS para requisições de API
  if (request.nextUrl.pathname.startsWith("/api")) {
    const responseCORS = configurarCORS(request);
    if (responseCORS.status !== 200) {
      return responseCORS;
    }

    // Previne CSRF para métodos não GET
    if (request.method !== "GET") {
      const responseCSRF = prevenirCSRF(request);
      if (responseCSRF.status !== 200) {
        return responseCSRF;
      }
    }
  }

  // Autentica rotas protegidas
  return autenticarRota(request);
}

/**
 * Configuração de quais caminhos o middleware deve ser executado
 */
export const config = {
  // Executa em todas as rotas exceto recursos estáticos, _next e api/docs
  matcher: [
    /*
     * Corresponde a todas as rotas exceto:
     * 1. Arquivos estáticos (arquivos com extensão)
     * 2. Rotas de API de documentação (/api/docs)
     * 3. Arquivos internos do Next.js (_next)
     */
    "/((?!_next|api/docs|.*\\..*).*)"  
  ],
};