// src/app/api/caixas/[id]/portas/[portaId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../../../../utils";
import { atualizarPortaSchema } from "../schema";

/**
 * Função auxiliar para verificar se o usuário tem acesso à caixa e se a porta existe
 */
async function verificarAcessoPorta(req: NextRequest, caixaId: string, portaId: string) {
  const token = await verificarAutenticacao(req);
  if (!token) {
    return { erro: NextResponse.json({ erro: "Não autorizado" }, { status: 401 }) };
  }

  // Busca a porta e verifica se pertence à caixa especificada
  const porta = await prisma.porta.findUnique({
    where: { id: portaId },
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
    },
  });

  if (!porta) {
    return { erro: NextResponse.json({ erro: "Porta não encontrada" }, { status: 404 }) };
  }

  if (porta.caixa.id !== caixaId) {
    return { erro: NextResponse.json({ erro: "A porta não pertence à caixa especificada" }, { status: 400 }) };
  }

  if (porta.caixa.tipo !== "CTO") {
    return { erro: NextResponse.json({ erro: "Esta caixa não é do tipo CTO" }, { status: 400 }) };
  }

  // Gerentes têm acesso a todas as caixas
  if (token.cargo === "Gerente") {
    return { temAcesso: true, token, porta };
  }

  // Verifica se o usuário tem acesso à cidade da caixa
  if (porta.caixa.cidade.usuarios.length === 0) {
    return { erro: NextResponse.json({ erro: "Você não tem acesso a esta caixa" }, { status: 403 }) };
  }

  return { temAcesso: true, token, porta };
}

/**
 * GET - Obtém detalhes de uma porta específica
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; portaId: string }>}) {
  const { id, portaId } = await params;
  try {
  

    // Verifica se o usuário tem acesso à porta
    const acesso = await verificarAcessoPorta(req, id, portaId);
    if (acesso.erro) return acesso.erro;

    // Retorna os detalhes da porta
    return NextResponse.json(acesso.porta);
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PATCH - Atualiza uma porta específica
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; portaId: string }> }) {
  try {
    // Verifica se o usuário tem permissão (Técnicos, Engenheiros e Gerentes podem atualizar portas)
    const permissaoErro = await verificarPermissao(req, ["Técnico", "Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id, portaId } = await params;

    // Verifica se o usuário tem acesso à porta
    const acesso = await verificarAcessoPorta(req, id, portaId);
    if (acesso.erro) return acesso.erro;

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = atualizarPortaSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const dadosAtualizacao = result.data;
    const statusAnterior = acesso.porta?.status;

    // Atualiza a porta no banco de dados
    const portaAtualizada = await prisma.porta.update({
      where: { id: portaId },
      data: dadosAtualizacao,
    });

    // Registra a ação no log de auditoria
    if (acesso.token) {
      await registrarLog({
        prisma,
        usuarioId: acesso.token.id as string,
        acao: "Atualização",
        entidade: "Porta",
        entidadeId: portaId,
        detalhes: {
          caixaId: id,
          statusAnterior,
          statusNovo: dadosAtualizacao.status,
          ...dadosAtualizacao,
        },
      });
    }

    return NextResponse.json({
      mensagem: "Porta atualizada com sucesso",
      porta: portaAtualizada,
    });
  } catch (error) {
    return tratarErro(error);
  }
}