// src/app/api/caixas/[id]/bandejas/[bandejaId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../../../../utils";
import { atualizarBandejaSchema } from "../schema";

/**
 * Função auxiliar para verificar se o usuário tem acesso à caixa e se a bandeja existe
 */
async function verificarAcessoBandeja(req: NextRequest, caixaId: string, bandejaId: string) {
  const token = await verificarAutenticacao(req);
  if (!token) {
    return { erro: NextResponse.json({ erro: "Não autorizado" }, { status: 401 }) };
  }

  // Busca a bandeja e verifica se pertence à caixa especificada
  const bandeja = await prisma.bandeja.findUnique({
    where: { id: bandejaId },
    include: {
      caixa: {
        select: {
          id: true,
          tipo: true,
          cidadeId: true,
          cidade: {
            select: {
              usuarios: {
                where: {
                  id: token.id as string,
                },
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          fusoes: true,
        },
      },
    },
  });

  if (!bandeja) {
    return { erro: NextResponse.json({ erro: "Bandeja não encontrada" }, { status: 404 }) };
  }

  if (bandeja.caixa.id !== caixaId) {
    return { erro: NextResponse.json({ erro: "A bandeja não pertence à caixa especificada" }, { status: 400 }) };
  }

  if (bandeja.caixa.tipo !== "CEO") {
    return { erro: NextResponse.json({ erro: "Esta caixa não é do tipo CEO" }, { status: 400 }) };
  }

  // Gerentes têm acesso a todas as caixas
  if (token.cargo === "Gerente") {
    return { temAcesso: true, token, bandeja };
  }

  // Verifica se o usuário tem acesso à cidade da caixa
  if (bandeja.caixa.cidade.usuarios.length === 0) {
    return { erro: NextResponse.json({ erro: "Você não tem acesso a esta caixa" }, { status: 403 }) };
  }

  return { temAcesso: true, token, bandeja };
}

/**
 * GET - Obtém detalhes de uma bandeja específica
 */
export async function GET(req: NextRequest, { params }: { params: { id: string; bandejaId: string } }) {
  try {
    const { id, bandejaId } = params;

    // Verifica se o usuário tem acesso à bandeja
    const acesso = await verificarAcessoBandeja(req, id, bandejaId);
    if (acesso.erro) return acesso.erro;

    // Busca as fusões associadas à bandeja
    const fusoes = await prisma.fusao.findMany({
      where: { bandejaId },
      orderBy: { atualizadoEm: "asc" },
    });

    // Retorna os detalhes da bandeja com suas fusões
    return NextResponse.json({
      ...acesso.bandeja,
      fusoes,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PATCH - Atualiza uma bandeja específica
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string; bandejaId: string } }) {
  try {
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem atualizar bandejas)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id, bandejaId } = params;

    // Verifica se o usuário tem acesso à bandeja
    const acesso = await verificarAcessoBandeja(req, id, bandejaId);
    if (acesso.erro) return acesso.erro;

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
    const capacidadeAnterior = acesso.bandeja?.capacidade;
    const fusoesCount = acesso.bandeja?._count.fusoes || 0;

    // Verifica se a nova capacidade é menor que o número de fusões
    if (dadosAtualizacao.capacidade && dadosAtualizacao.capacidade < fusoesCount) {
      return NextResponse.json(
        { 
          erro: "Não é possível reduzir a capacidade para um valor menor que o número de fusões existentes", 
          detalhes: { 
            capacidadeSolicitada: dadosAtualizacao.capacidade, 
            fusoesExistentes: fusoesCount 
          } 
        },
        { status: 400 }
      );
    }

    // Atualiza a bandeja no banco de dados
    const bandejaAtualizada = await prisma.bandeja.update({
      where: { id: bandejaId },
      data: dadosAtualizacao,
    });

    // Registra a ação no log de auditoria
    if (acesso.token) {
      await registrarLog({
        prisma,
        usuarioId: acesso.token.id as string,
        acao: "Atualização",
        entidade: "Bandeja",
        entidadeId: bandejaId,
        detalhes: {
          caixaId: id,
          capacidadeAnterior,
          capacidadeNova: dadosAtualizacao.capacidade,
          ...dadosAtualizacao,
        },
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