// src/app/api/capilares/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../../utils";
import { atualizarCapilarSchema } from "../schema";

/**
 * GET - Obtém um capilar específico por ID
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

    // Busca o capilar com todas as informações relacionadas
    const capilar = await prisma.capilar.findUnique({
      where: { id },
      include: {
        rota: {
          select: {
            id: true,
            nome: true,
            tipoCabo: true,
            fabricante: true,
          },
        },
        saidas: {
          include: {
            capilarEntrada: true,
          },
        },
        entradas: {
          include: {
            capilarSaida: true,
          },
        },
        spliter_saida: {
          include: {
            caixa: true,
            capilarEntrada: true,
          },
        },
        spliter_entrada: {
          include: {
            caixa: true,
            capilarSaida: true,
          },
        },
        _count: {
          select: {
            saidas: true,
            entradas: true,
            spliter_saida: true,
            spliter_entrada: true,
          },
        },
      },
    });

    if (!capilar) {
      return NextResponse.json(
        { erro: "Capilar não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(capilar);
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PATCH - Atualiza um capilar específico por ID
 */
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem atualizar capilares)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se o capilar existe
    const capilarExistente = await prisma.capilar.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });

    if (!capilarExistente) {
      return NextResponse.json(
        { erro: "Capilar não encontrado" },
        { status: 404 }
      );
    }

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = atualizarCapilarSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const dadosAtualizacao = result.data;

    // Se estiver alterando a rota, verifica se a rota existe
    if (dadosAtualizacao.rotaId) {
      const rota = await prisma.rota.findUnique({
        where: { id: dadosAtualizacao.rotaId },
      });

      if (!rota) {
        return NextResponse.json(
          { erro: "Rota não encontrada" },
          { status: 404 }
        );
      }
    }

    // Atualiza o capilar no banco de dados
    const capilarAtualizado = await prisma.capilar.update({
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
        entidade: "Capilar",
        entidadeId: id,
        detalhes: dadosAtualizacao,
      });
    }

    return NextResponse.json({
      mensagem: "Capilar atualizado com sucesso",
      capilar: capilarAtualizado,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * DELETE - Remove um capilar específico por ID
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (apenas Gerentes podem excluir capilares)
    const permissaoErro = await verificarPermissao(req, ["Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se o capilar existe
    const capilar = await prisma.capilar.findUnique({
      where: { id },
      select: {
        id: true,
        numero: true,
        tipo: true,
        _count: {
          select: {
            saidas: true,
            entradas: true,
            spliter_saida: true,
            spliter_entrada: true,
          },
        },
      },
    });

    if (!capilar) {
      return NextResponse.json(
        { erro: "Capilar não encontrado" },
        { status: 404 }
      );
    }

    // Verifica se existem emendas ou spliters associados
    if (
      capilar._count.saidas > 0 ||
      capilar._count.entradas > 0 ||
      capilar._count.spliter_saida > 0 ||
      capilar._count.spliter_entrada > 0
    ) {
      return NextResponse.json(
        { erro: "Não é possível excluir o capilar porque existem emendas ou spliters associados" },
        { status: 400 }
      );
    }

    // Exclui o capilar
    await prisma.capilar.delete({
      where: { id },
    });

    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Exclusão",
        entidade: "Capilar",
        entidadeId: id,
        detalhes: { numero: capilar.numero, tipo: capilar.tipo },
      });
    }

    return NextResponse.json({
      mensagem: "Capilar excluído com sucesso",
    });
  } catch (error) {
    return tratarErro(error);
  }
}