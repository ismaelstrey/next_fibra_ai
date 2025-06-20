// src/app/api/bandejas/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../../utils";
import { atualizarBandejaSchema } from "../schema";

/**
 * GET - Obtém uma bandeja específica por ID
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

    // Busca a bandeja com todas as informações relacionadas
    const bandeja = await prisma.bandeja.findUnique({
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
        fusoes: true,
      },
    });

    if (!bandeja) {
      return NextResponse.json(
        { erro: "Bandeja não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(bandeja);
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PATCH - Atualiza uma bandeja específica por ID
 */
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem atualizar bandejas)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se a bandeja existe
    const bandejaExistente = await prisma.bandeja.findUnique({
      where: { id },
      include: {
        fusoes: true,
      },
    });

    if (!bandejaExistente) {
      return NextResponse.json(
        { erro: "Bandeja não encontrada" },
        { status: 404 }
      );
    }

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = atualizarBandejaSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const dadosAtualizacao = result.data;

    // Se estiver alterando o status e a bandeja tiver fusões
    if (dadosAtualizacao.status && dadosAtualizacao.status !== "Em uso" && bandejaExistente.fusoes.length > 0) {
      return NextResponse.json(
        { erro: "Não é possível alterar o status de uma bandeja que possui fusões" },
        { status: 400 }
      );
    }

    // Se estiver alterando a caixa, verifica se ela existe e é do tipo CEO
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

      if (caixa.tipo !== "CEO") {
        return NextResponse.json(
          { erro: "Apenas caixas do tipo CEO podem ter bandejas" },
          { status: 400 }
        );
      }

      // Verifica se já existe uma bandeja com o mesmo número na nova caixa
      const numeroBandeja = dadosAtualizacao.numero || bandejaExistente.numero;
      const bandejaExistenteNaCaixa = await prisma.bandeja.findFirst({
        where: {
          numero: numeroBandeja,
          caixaId: dadosAtualizacao.caixaId,
          id: { not: id }, // Exclui a bandeja atual da verificação
        },
      });

      if (bandejaExistenteNaCaixa) {
        return NextResponse.json(
          { erro: `Já existe uma bandeja com o número ${numeroBandeja} na caixa de destino` },
          { status: 400 }
        );
      }
    }

    // Se estiver alterando o número, verifica se já existe uma bandeja com o mesmo número na mesma caixa
    if (dadosAtualizacao.numero) {
      const caixaId = dadosAtualizacao.caixaId || bandejaExistente.caixaId;
      const bandejaExistenteComNumero = await prisma.bandeja.findFirst({
        where: {
          numero: dadosAtualizacao.numero,
          caixaId,
          id: { not: id }, // Exclui a bandeja atual da verificação
        },
      });

      if (bandejaExistenteComNumero) {
        return NextResponse.json(
          { erro: `Já existe uma bandeja com o número ${dadosAtualizacao.numero} nesta caixa` },
          { status: 400 }
        );
      }
    }

    // Atualiza a bandeja no banco de dados
    const bandejaAtualizada = await prisma.bandeja.update({
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
        entidade: "Bandeja",
        entidadeId: id,
        detalhes: dadosAtualizacao,
      });
    }

    return NextResponse.json({
      mensagem: "Bandeja atualizada com sucesso",
      bandeja: bandejaAtualizada,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * DELETE - Remove uma bandeja específica por ID
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (apenas Gerentes podem excluir bandejas)
    const permissaoErro = await verificarPermissao(req, ["Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se a bandeja existe
    const bandeja = await prisma.bandeja.findUnique({
      where: { id },
      include: {
        fusoes: true,
      },
    });

    if (!bandeja) {
      return NextResponse.json(
        { erro: "Bandeja não encontrada" },
        { status: 404 }
      );
    }

    // Verifica se a bandeja possui fusões
    if (bandeja.fusoes.length > 0) {
      return NextResponse.json(
        { erro: "Não é possível excluir uma bandeja que possui fusões" },
        { status: 400 }
      );
    }

    // Exclui a bandeja
    await prisma.bandeja.delete({
      where: { id },
    });

    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Exclusão",
        entidade: "Bandeja",
        entidadeId: id,
        detalhes: { numero: bandeja.numero, status: bandeja.status },
      });
    }

    return NextResponse.json({
      mensagem: "Bandeja excluída com sucesso",
    });
  } catch (error) {
    return tratarErro(error);
  }
}