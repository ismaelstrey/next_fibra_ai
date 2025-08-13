// src/middlewares/validacao.ts

import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { tratarErro } from "@/utils/erros";

/**
 * Middleware para validar o corpo da requisição usando Zod
 * @param schema - Schema Zod para validação
 * @returns Middleware de validação
 */
export function validarCorpo<T>(schema: ZodSchema<T>) {
  return async (req: NextRequest) => {
    try {
      const body = await req.json();
      const resultado = schema.safeParse(body);

      if (!resultado.success) {
        return NextResponse.json(
          { 
            mensagem: "Erro de validação", 
            detalhes: resultado.error.errors 
          },
          { status: 400 }
        );
      }

      // Retorna os dados validados
      return { dados: resultado.data as T };
    } catch (erro) {
      return tratarErro(erro);
    }
  };
}

/**
 * Middleware para validar parâmetros de consulta usando Zod
 * @param schema - Schema Zod para validação
 * @returns Middleware de validação
 */
export function validarQuery<T>(schema: ZodSchema<T>) {
  return (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url);
      const params: Record<string, string> = {};
      
      // Converte searchParams para objeto
      searchParams.forEach((valor, chave) => {
        params[chave] = valor;
      });

      const resultado = schema.safeParse(params);

      if (!resultado.success) {
        return NextResponse.json(
          { 
            mensagem: "Parâmetros de consulta inválidos", 
            detalhes: resultado.error.errors 
          },
          { status: 400 }
        );
      }

      // Retorna os dados validados
      return { dados: resultado.data as T };
    } catch (erro) {
      return tratarErro(erro);
    }
  };
}

/**
 * Middleware para limitar a taxa de requisições por IP
 * @param maxRequests - Número máximo de requisições permitidas
 * @param windowMs - Janela de tempo em milissegundos
 * @returns Middleware de limitação de taxa
 */
export function limitarRequisicoes(maxRequests = 100, windowMs = 60000) {
  // Armazena contadores de requisições por IP
  const requestCounts = new Map<string, { count: number; resetTime: number }>();

  return (req: NextRequest) => {
    const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();

    // Obtém ou inicializa o contador para este IP
    let requestData = requestCounts.get(ip);
    if (!requestData || now > requestData.resetTime) {
      requestData = { count: 0, resetTime: now + windowMs };
      requestCounts.set(ip, requestData);
    }

    // Incrementa o contador
    requestData.count++;

    // Verifica se excedeu o limite
    if (requestData.count > maxRequests) {
      return NextResponse.json(
        { mensagem: "Muitas requisições, tente novamente mais tarde" },
        { status: 429 }
      );
    }

    // Limpa entradas antigas periodicamente
    if (requestCounts.size > 10000) {
      const keysToDelete = [];
      for (const [key, value] of requestCounts.entries()) {
        if (now > value.resetTime) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => requestCounts.delete(key));
    }

    // Continua para o próximo middleware
    return null;
  };
}

/**
 * Middleware para validar e sanitizar parâmetros de rota
 * @param paramName - Nome do parâmetro de rota
 * @param pattern - Padrão regex para validação
 * @returns Middleware de validação
 */
export function validarParametroRota(paramName: string, pattern: RegExp) {
  return (req: NextRequest) => {
    const { pathname } = new URL(req.url);
    const segments = pathname.split("/");
    const paramIndex = segments.findIndex(segment => segment.includes(paramName));

    if (paramIndex !== -1) {
      const paramValue = segments[paramIndex].replace(`[${paramName}]`, "");
      
      if (!pattern.test(paramValue)) {
        return NextResponse.json(
          { mensagem: `Parâmetro ${paramName} inválido` },
          { status: 400 }
        );
      }
    }

    // Continua para o próximo middleware
    return null;
  };
}