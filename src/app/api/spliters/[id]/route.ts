// src/app/api/spliters/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../../utils";
import { atualizarSpliterSchema } from "../schema";

/**
 * GET - Obtém um spliter específico por ID
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

    // Busca o spliter com todas as informações relacionadas
    const spliter = await prisma.spliter.findUnique({
      where: { id },
      include: {
        caixa: {
          select: {
            id: true,
            nome: true,
            tipo: true,
            coordenadas: true,
            cidade: {
              select: {
                id: true,
                nome: true,
                estado: true,
              },
            },
            rota: {
              select: {
                id: true,
                nome: true,
                tipoCabo: true,
              },
            },
          },
        },
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

    if (!spliter) {
      return NextResponse.json(
        { erro: "Spliter não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(spliter);
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PATCH - Atualiza um spliter específico por ID
 */
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem atualizar spliters)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se o spliter existe
    const spliterExistente = await prisma.spliter.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });

    if (!spliterExistente) {
      return NextResponse.json(
        { erro: "Spliter não encontrado" },
        { status: 404 }
      );
    }

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = atualizarSpliterSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const dadosAtualizacao = result.data;

    // Se estiver alterando a caixa, verifica se ela existe
    if (dadosAtualizacao.caixaId) {
      const caixa = await prisma.caixa.findUnique({
        where: { id: dadosAtualizacao.caixaId },
      });

      if (!caixa) {
        return NextResponse.json(
          { erro: "Caixa não encontrada" },
          { status: 404 }
        );
      }
    }

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

    // Atualiza o spliter no banco de dados
    const spliterAtualizado = await prisma.spliter.update({
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
        entidade: "Spliter",
        entidadeId: id,
        detalhes: dadosAtualizacao,
      });
    }

    return NextResponse.json({
      mensagem: "Spliter atualizado com sucesso",
      spliter: spliterAtualizado,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * DELETE - Remove um spliter específico por ID
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (apenas Gerentes podem excluir spliters)
    const permissaoErro = await verificarPermissao(req, ["Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se o spliter existe
    const spliter = await prisma.spliter.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        tipo: true,
      },
    });

    if (!spliter) {
      return NextResponse.json(
        { erro: "Spliter não encontrado" },
        { status: 404 }
      );
    }

    // Exclui o spliter
    await prisma.spliter.delete({
      where: { id },
    });

    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Exclusão",
        entidade: "Spliter",
        entidadeId: id,
        detalhes: { nome: spliter.nome, tipo: spliter.tipo },
      });
    }

    return NextResponse.json({
      mensagem: "Spliter excluído com sucesso",
    });
  } catch (error) {
    return tratarErro(error);
  }
}