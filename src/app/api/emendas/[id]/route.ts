// src/app/api/emendas/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../../utils";
import { atualizarEmendaSchema } from "../schema";

/**
 * GET - Obtém uma emenda específica por ID
 */
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário está autenticado
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json(
        { erro: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Busca a emenda com todas as informações relacionadas
    const emenda = await prisma.emenda.findUnique({
      where: { id },
      include: {
        capilarSaida: {
          select: {
            id: true,
            numero: true,
            tipo: true,
            comprimento: true,
            status: true,
            potencia: true,
            rota: {
              select: {
                id: true,
                nome: true,
                tipoCabo: true,
              },
            },
          },
        },
        capilarEntrada: {
          select: {
            id: true,
            numero: true,
            tipo: true,
            comprimento: true,
            status: true,
            potencia: true,
            rota: {
              select: {
                id: true,
                nome: true,
                tipoCabo: true,
              },
            },
          },
        },
      },
    });

    if (!emenda) {
      return NextResponse.json(
        { erro: "Emenda não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(emenda);
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PATCH - Atualiza uma emenda específica por ID
 */
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem atualizar emendas)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se a emenda existe
    const emendaExistente = await prisma.emenda.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });

    if (!emendaExistente) {
      return NextResponse.json(
        { erro: "Emenda não encontrada" },
        { status: 404 }
      );
    }

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = atualizarEmendaSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const dadosAtualizacao = result.data;

    // Se estiver alterando os capilares, verifica se eles existem
    if (dadosAtualizacao.capilarSaidaId) {
      const capilarSaida = await prisma.capilar.findUnique({
        where: { id: dadosAtualizacao.capilarSaidaId },
      });

      if (!capilarSaida) {
        return NextResponse.json(
          { erro: "Capilar de saída não encontrado" },
          { status: 404 }
        );
      }
    }

    if (dadosAtualizacao.capilarEntradaId) {
      const capilarEntrada = await prisma.capilar.findUnique({
        where: { id: dadosAtualizacao.capilarEntradaId },
      });

      if (!capilarEntrada) {
        return NextResponse.json(
          { erro: "Capilar de entrada não encontrado" },
          { status: 404 }
        );
      }
    }

    // Se estiver alterando ambos os capilares, verifica se já existe uma emenda entre eles
    if (dadosAtualizacao.capilarSaidaId && dadosAtualizacao.capilarEntradaId) {
      const emendaExistente = await prisma.emenda.findFirst({
        where: {
          id: { not: id },
          capilarSaidaId: dadosAtualizacao.capilarSaidaId,
          capilarEntradaId: dadosAtualizacao.capilarEntradaId,
        },
      });

      if (emendaExistente) {
        return NextResponse.json(
          { erro: "Já existe uma emenda entre esses capilares" },
          { status: 400 }
        );
      }
    }

    // Atualiza a emenda no banco de dados
    const emendaAtualizada = await prisma.emenda.update({
      where: { id },
      data: dadosAtualizacao,
    });

    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Atualização",
        entidade: "Emenda",
        entidadeId: id,
        detalhes: dadosAtualizacao,
      });
    }

    return NextResponse.json({
      mensagem: "Emenda atualizada com sucesso",
      emenda: emendaAtualizada,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * DELETE - Remove uma emenda específica por ID
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (apenas Gerentes podem excluir emendas)
    const permissaoErro = await verificarPermissao(req, ["Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se a emenda existe
    const emenda = await prisma.emenda.findUnique({
      where: { id },
      select: {
        id: true,
        localizacao: true,
      },
    });

    if (!emenda) {
      return NextResponse.json(
        { erro: "Emenda não encontrada" },
        { status: 404 }
      );
    }

    // Exclui a emenda
    await prisma.emenda.delete({
      where: { id },
    });

    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Exclusão",
        entidade: "Emenda",
        entidadeId: id,
        detalhes: { localizacao: emenda.localizacao },
      });
    }

    return NextResponse.json({
      mensagem: "Emenda excluída com sucesso",
    });
  } catch (error) {
    return tratarErro(error);
  }
}