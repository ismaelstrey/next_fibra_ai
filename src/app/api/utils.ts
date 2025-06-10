// src/app/api/utils.ts

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { ZodError } from "zod";

/**
 * Verifica se o usuário está autenticado
 * @param req - Requisição Next.js
 * @returns Token de autenticação ou null
 */
export async function verificarAutenticacao(req: NextRequest) {
  return await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
}

/**
 * Verifica se o usuário tem permissão para acessar a rota
 * @param req - Requisição Next.js
 * @param cargosPermitidos - Lista de cargos permitidos
 * @returns Resposta de erro ou null se autorizado
 */
export async function verificarPermissao(req: NextRequest, cargosPermitidos: string[] = []) {
  const token = await verificarAutenticacao(req);
  
  if (!token) {
    return NextResponse.json(
      { erro: "Não autorizado" },
      { status: 401 }
    );
  }

  // Se não há restrição de cargos, apenas verifica autenticação
  if (cargosPermitidos.length === 0) {
    return null;
  }

  // Verifica se o cargo do usuário está na lista de permitidos
  const cargo = token.cargo as string;
  if (!cargosPermitidos.includes(cargo)) {
    return NextResponse.json(
      { erro: "Acesso negado" },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Trata erros de validação do Zod
 * @param error - Erro do Zod
 * @returns Resposta formatada com os erros
 */
export function tratarErroValidacao(error: ZodError) {
  return NextResponse.json(
    { erro: "Dados inválidos", detalhes: error.format() },
    { status: 400 }
  );
}

/**
 * Trata erros gerais da API
 * @param error - Erro capturado
 * @returns Resposta formatada com o erro
 */
export function tratarErro(error: unknown) {
  console.error("Erro na API:", error);
  
  if (error instanceof ZodError) {
    return tratarErroValidacao(error);
  }
  
  return NextResponse.json(
    { erro: "Erro interno do servidor" },
    { status: 500 }
  );
}

/**
 * Registra uma ação no log de auditoria
 * @param usuarioId - ID do usuário que realizou a ação
 * @param acao - Tipo de ação (Criação, Edição, Exclusão)
 * @param entidade - Nome da entidade (Rota, Caixa, etc.)
 * @param entidadeId - ID da entidade
 * @param detalhes - Detalhes adicionais da ação
 */
export async function registrarLog({
  prisma,
  usuarioId,
  acao,
  entidade,
  entidadeId,
  detalhes
}: {
  prisma: any;
  usuarioId: string;
  acao: string;
  entidade: string;
  entidadeId: string;
  detalhes?: any;
}) {
  try {
    await prisma.log.create({
      data: {
        usuarioId,
        acao,
        entidade,
        entidadeId,
        detalhes
      }
    });
  } catch (error) {
    console.error("Erro ao registrar log:", error);
  }
}