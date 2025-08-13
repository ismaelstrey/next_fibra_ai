// src/utils/erros.ts

import { NextResponse } from "next/server";
import { ZodError } from "zod";

// Tipos de erros da aplicação
export type ErroAplicacao = {
  codigo: number;
  mensagem: string;
  detalhes?: any;
};

/**
 * Trata erros da aplicação e retorna uma resposta adequada
 * @param erro - Erro capturado
 * @returns Resposta Next.js com status e mensagem de erro
 */
export function tratarErro(erro: unknown): NextResponse {
  console.error("Erro capturado:", erro);

  // Erro de validação do Zod
  if (erro instanceof ZodError) {
    return NextResponse.json(
      { 
        mensagem: "Erro de validação", 
        detalhes: erro.errors 
      },
      { status: 400 }
    );
  }

  // Erro personalizado da aplicação
  if (typeof erro === "object" && erro !== null && "codigo" in erro && "mensagem" in erro) {
    const erroApp = erro as ErroAplicacao;
    return NextResponse.json(
      { 
        mensagem: erroApp.mensagem, 
        detalhes: erroApp.detalhes 
      },
      { status: erroApp.codigo }
    );
  }

  // Erro de Prisma (verificação básica)
  if (typeof erro === "object" && erro !== null && "code" in erro && typeof erro.code === "string") {
    // Mapeia códigos de erro do Prisma para HTTP status
    if (erro.code === "P2002") {
      return NextResponse.json(
        { mensagem: "Registro duplicado" },
        { status: 409 }
      );
    }
    if (erro.code === "P2025") {
      return NextResponse.json(
        { mensagem: "Registro não encontrado" },
        { status: 404 }
      );
    }
  }

  // Erro genérico
  const mensagem = erro instanceof Error ? erro.message : "Erro interno do servidor";
  return NextResponse.json(
    { mensagem },
    { status: 500 }
  );
}

/**
 * Cria um erro de aplicação com código e mensagem
 * @param codigo - Código HTTP do erro
 * @param mensagem - Mensagem de erro
 * @param detalhes - Detalhes adicionais (opcional)
 * @returns Erro formatado
 */
export function criarErro(codigo: number, mensagem: string, detalhes?: any): ErroAplicacao {
  return { codigo, mensagem, detalhes };
}

/**
 * Lança um erro de não autorizado
 */
export function erroNaoAutorizado(mensagem = "Não autorizado"): never {
  throw criarErro(401, mensagem);
}

/**
 * Lança um erro de acesso proibido
 */
export function erroProibido(mensagem = "Acesso proibido"): never {
  throw criarErro(403, mensagem);
}

/**
 * Lança um erro de não encontrado
 */
export function erroNaoEncontrado(mensagem = "Recurso não encontrado"): never {
  throw criarErro(404, mensagem);
}

/**
 * Lança um erro de validação
 */
export function erroValidacao(mensagem = "Dados inválidos", detalhes?: any): never {
  throw criarErro(400, mensagem, detalhes);
}