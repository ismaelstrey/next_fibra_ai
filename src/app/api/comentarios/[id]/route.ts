// src/app/api/comentarios/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { tratarErro, verificarAutenticacao, registrarLog } from "../../utils";
import { atualizarComentarioSchema } from "../schema";

/**
 * Função auxiliar para verificar se o usuário tem acesso ao comentário
 */
async function verificarAcessoComentario(req: NextRequest, comentarioId: string) {
  const token = await verificarAutenticacao(req);
  if (!token) {
    return { erro: NextResponse.json({ erro: "Não autorizado" }, { status: 401 }) };
  }

  // Busca o comentário com informações da caixa ou rota associada
  const comentario = await prisma.comentario.findUnique({
    where: { id: comentarioId },
    select: {
      id: true,
      conteudo: true,
      usuarioId: true,
      caixaId: true,
      rotaId: true,
      caixa: {
        select: {
          id: true,
          cidadeId: true,
          cidade: {
            select: {
              id: true,
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
      rota: {
        select: {
          id: true,
          cidadeId: true,
          cidade: {
            select: {
              id: true,
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

  if (!comentario) {
    return { erro: NextResponse.json({ erro: "Comentário não encontrado" }, { status: 404 }) };
  }

  // Gerentes têm acesso a todos os comentários
  if (token.cargo === "Gerente") {
    return { temAcesso: true, token, comentario };
  }

  // O autor do comentário tem acesso
  if (comentario.usuarioId === token.id) {
    return { temAcesso: true, token, comentario };
  }

  // Verifica se o usuário tem acesso à cidade da caixa ou rota associada
  let temAcessoCidade = false;

  if (comentario.caixa && comentario.caixa.cidade.usuarios.length > 0) {
    temAcessoCidade = true;
  }

  if (comentario.rota && comentario.rota.cidade.usuarios.length > 0) {
    temAcessoCidade = true;
  }

  if (!temAcessoCidade) {
    return { erro: NextResponse.json({ erro: "Você não tem acesso a este comentário" }, { status: 403 }) };
  }

  return { temAcesso: true, token, comentario };
}

/**
 * GET - Obtém detalhes de um comentário específico
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Verifica se o usuário tem acesso ao comentário
    const acesso = await verificarAcessoComentario(req, id);
    if (acesso.erro) return acesso.erro;

    // Busca os detalhes completos do comentário
    const comentario = await prisma.comentario.findUnique({
      where: { id },
      select: {
        id: true,
        conteudo: true,
        criadoEm: true,
        atualizadoEm: true,
        caixaId: true,
        rotaId: true,
        usuarioId: true,
        caixa: acesso.comentario?.caixaId ? {
          select: {
            id: true,
            nome: true,
            tipo: true,
            cidade: {
              select: {
                id: true,
                nome: true,
                estado: true,
              },
            },
          },
        } : false,
        rota: acesso.comentario?.rotaId ? {
          select: {
            id: true,
            nome: true,
            tipoCabo: true,
            cidade: {
              select: {
                id: true,
                nome: true,
                estado: true,
              },
            },
          },
        } : false,
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

    return NextResponse.json(comentario);
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PATCH - Atualiza um comentário específico
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Verifica se o usuário tem acesso ao comentário
    const acesso = await verificarAcessoComentario(req, id);
    if (acesso.erro) return acesso.erro;

    // Apenas o autor do comentário ou um gerente pode atualizar o comentário
    if (acesso.comentario?.usuarioId !== acesso.token?.id && acesso.token?.cargo !== "Gerente") {
      return NextResponse.json(
        { erro: "Você não tem permissão para atualizar este comentário" },
        { status: 403 }
      );
    }

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = atualizarComentarioSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const { conteudo } = result.data;

    // Atualiza o comentário no banco de dados
    const comentarioAtualizado = await prisma.comentario.update({
      where: { id },
      data: { conteudo },
    });

    // Registra a ação no log de auditoria
    if (acesso.token) {
      await registrarLog({
        prisma,
        usuarioId: acesso.token.id as string,
        acao: "Atualização",
        entidade: "Comentário",
        entidadeId: id,
        detalhes: { conteudo },
      });
    }

    // Retorna os dados do comentário atualizado
    return NextResponse.json({
      mensagem: "Comentário atualizado com sucesso",
      comentario: comentarioAtualizado,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * DELETE - Remove um comentário específico
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Verifica se o usuário tem acesso ao comentário
    const acesso = await verificarAcessoComentario(req, id);
    if (acesso.erro) return acesso.erro;

    // Apenas o autor do comentário ou um gerente pode excluir o comentário
    if (acesso.comentario?.usuarioId !== acesso.token?.id && acesso.token?.cargo !== "Gerente") {
      return NextResponse.json(
        { erro: "Você não tem permissão para excluir este comentário" },
        { status: 403 }
      );
    }

    // Remove o comentário do banco de dados
    await prisma.comentario.delete({
      where: { id },
    });

    // Registra a ação no log de auditoria
    if (acesso.token) {
      await registrarLog({
        prisma,
        usuarioId: acesso.token.id as string,
        acao: "Exclusão",
        entidade: "Comentário",
        entidadeId: id,
        detalhes: { id },
      });
    }

    // Retorna mensagem de sucesso
    return NextResponse.json({
      mensagem: "Comentário excluído com sucesso",
    });
  } catch (error) {
    return tratarErro(error);
  }
}