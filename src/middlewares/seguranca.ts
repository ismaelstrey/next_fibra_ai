// src/middlewares/seguranca.ts

import { NextRequest, NextResponse } from "next/server";
import { SECURITY_CONFIG } from "@/config/env";

/**
 * Middleware para adicionar cabeçalhos de segurança às respostas
 * @param req - Requisição Next.js
 * @returns Resposta com cabeçalhos de segurança
 */
export function adicionarCabecalhosSeguranca(req: NextRequest) {
  const response = NextResponse.next();

  // Cabeçalhos de segurança básicos
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self';"
  );

  // Strict Transport Security (apenas em produção)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return response;
}

/**
 * Middleware para configurar CORS
 * @param req - Requisição Next.js
 * @returns Resposta com cabeçalhos CORS
 */
export function configurarCORS(req: NextRequest) {
  // Se CORS não estiver habilitado, apenas continua
  if (!SECURITY_CONFIG.CORS_ENABLED) {
    return NextResponse.next();
  }

  // Obtém a origem da requisição
  const origem = req.headers.get("origin") || "";
  
  // Verifica se a origem está na lista de origens permitidas
  const origensPermitidas = SECURITY_CONFIG.CORS_ORIGINS;
  const permitirQualquerOrigem = origensPermitidas.includes("*");
  const origemPermitida = permitirQualquerOrigem || origensPermitidas.includes(origem);

  // Se for uma requisição OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    
    // Adiciona cabeçalhos CORS para preflight
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Max-Age", "86400"); // 24 horas
    
    // Adiciona cabeçalho de origem permitida
    if (permitirQualquerOrigem) {
      response.headers.set("Access-Control-Allow-Origin", "*");
    } else if (origemPermitida) {
      response.headers.set("Access-Control-Allow-Origin", origem);
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
    
    return response;
  }

  // Para requisições normais
  const response = NextResponse.next();
  
  // Adiciona cabeçalhos CORS
  if (permitirQualquerOrigem) {
    response.headers.set("Access-Control-Allow-Origin", "*");
  } else if (origemPermitida) {
    response.headers.set("Access-Control-Allow-Origin", origem);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }
  
  return response;
}

/**
 * Middleware para prevenir ataques de CSRF
 * @param req - Requisição Next.js
 * @returns Resposta ou erro se CSRF for detectado
 */
export function prevenirCSRF(req: NextRequest) {
  // Métodos que podem modificar dados
  const metodosModificadores = ["POST", "PUT", "DELETE", "PATCH"];
  
  // Verifica se é um método que pode modificar dados
  if (metodosModificadores.includes(req.method)) {
    // Verifica o cabeçalho Referer ou Origin
    const referer = req.headers.get("referer");
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    
    // Se não houver referer ou origin, pode ser suspeito
    if (!referer && !origin) {
      return NextResponse.json(
        { mensagem: "Cabeçalho Referer ou Origin ausente" },
        { status: 403 }
      );
    }
    
    // Verifica se o referer ou origin corresponde ao host
    const refererUrl = referer ? new URL(referer) : null;
    const originUrl = origin ? new URL(origin) : null;
    
    if (
      (refererUrl && !refererUrl.host.includes(host || "")) &&
      (originUrl && !originUrl.host.includes(host || ""))
    ) {
      return NextResponse.json(
        { mensagem: "Possível ataque CSRF detectado" },
        { status: 403 }
      );
    }
  }
  
  return NextResponse.next();
}