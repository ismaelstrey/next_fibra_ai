// src/app/api/logs/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao } from "../../utils";

/**
 * GET - Obtém detalhes de um log específico
 * Apenas usuários com cargo de Gerente podem acessar os logs
 */
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;

    // Verifica autenticação
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    // Verifica se o usuário tem permissão de Gerente
    if (!(await verificarPermissao(req, ["Gerente"]))) {
      return NextResponse.json(
        { erro: "Você não tem permissão para acessar os logs de auditoria" },
        { status: 403 }
      );
    }

    // Busca o log pelo ID
    const log = await prisma.log.findUnique({
      where: { id },
      select: {
        id: true,
        acao: true,
        entidade: true,
        entidadeId: true,
        detalhes: true,
        criadoEm: true,
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            cargo: true,
            imagem: true,
          },
        },
      },
    });

    // Se o log não for encontrado, retorna erro 404
    if (!log) {
      return NextResponse.json({ erro: "Log não encontrado" }, { status: 404 });
    }

    // Retorna os detalhes do log
    return NextResponse.json(log);
  } catch (error) {
    return tratarErro(error);
  }
}