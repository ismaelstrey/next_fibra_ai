// src/app/api/fusoes/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../../utils";
import { atualizarFusaoSchema } from "../schema";


/**
 * Função auxiliar para verificar se o usuário tem acesso à fusão
 */
async function verificarAcessoFusao(req: NextRequest, fusaoId: string) {
  const token = await verificarAutenticacao(req);
  if (!token) {
    return { erro: NextResponse.json({ erro: "Não autorizado" }, { status: 401 }) };
  }

  // Busca a fusão com informações da caixa e cidade
  const fusao = await prisma.fusao.findUnique({
    where: { id: fusaoId },
    include: {
      capilarOrigem: {
        select: {
          id: true,
          numero: true,
          tipo: true,
          status: true,
          tubo: {
            select: {
              numero: true,
              tipo: true,
            },
          },
        },
      },
      capilarDestino: {
        select: {
          id: true,
          numero: true,
          tipo: true,
          status: true,
          tubo: {
            select: {
              numero: true,
              tipo: true,
            },
          },
        },
      },
      caixa: {
        select: {
          id: true,
          nome: true,
          tipo: true,
          cidadeId: true,
          cidade: {
            select: {
              id: true,
              nome: true,
              estado: true,
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
      bandeja: {
        select: {
          id: true,
          numero: true,
          capacidade: true,
        },
      },
      criadoPor: {
        select: {
          id: true,
          nome: true,
          cargo: true,
        },
      },
    },
  });

  if (!fusao) {
    return { erro: NextResponse.json({ erro: "Fusão não encontrada" }, { status: 404 }) };
  }

  // Verifica se a caixa é do tipo CEO
  if (fusao.caixa.tipo !== "CEO") {
    return { erro: NextResponse.json({ erro: "Esta caixa não suporta fusões" }, { status: 400 }) };
  }

  // Gerentes têm acesso a todas as fusões
  if (token.cargo === "Gerente") {
    return { temAcesso: true, token, fusao };
  }

  // Verifica se o usuário tem acesso à cidade da caixa
  if (fusao.caixa.cidade.usuarios.length === 0) {
    return { erro: NextResponse.json({ erro: "Você não tem acesso a esta fusão" }, { status: 403 }) };
  }

  return { temAcesso: true, token, fusao };
}

/**
 * GET - Obtém detalhes de uma fusão específica
 */
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;

    // Verifica se o usuário tem acesso à fusão
    const acesso = await verificarAcessoFusao(req, id);
    if (acesso.erro) return acesso.erro;

    // Retorna os detalhes da fusão
    return NextResponse.json(acesso.fusao);
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PATCH - Atualiza uma fusão específica
 */
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (Técnicos, Engenheiros e Gerentes podem atualizar fusões)
    const permissaoErro = await verificarPermissao(req, ["Técnico", "Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se o usuário tem acesso à fusão
    const acesso = await verificarAcessoFusao(req, id);
    if (acesso.erro) return acesso.erro;

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = atualizarFusaoSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const dadosAtualizacao = result.data;

    // Se estiver alterando a bandeja, verifica se a nova bandeja existe e pertence à mesma caixa
    if (dadosAtualizacao.bandejaId && dadosAtualizacao.bandejaId !== acesso.fusao?.bandejaId) {
      const bandeja = await prisma.bandeja.findUnique({
        where: { id: dadosAtualizacao.bandejaId },
        select: {
          caixaId: true,
          capacidade: true,
          _count: {
            select: {
              fusoes: true,
            },
          },
        },
      });

      if (!bandeja) {
        return NextResponse.json(
          { erro: "Bandeja não encontrada" },
          { status: 404 }
        );
      }

      if (bandeja.caixaId !== acesso.fusao?.caixaId) {
        return NextResponse.json(
          { erro: "A bandeja não pertence à mesma caixa da fusão" },
          { status: 400 }
        );
      }

      // Verifica se a bandeja tem capacidade disponível
      if (bandeja._count.fusoes >= bandeja.capacidade) {
        return NextResponse.json(
          {
            erro: "A bandeja não tem capacidade disponível",
            detalhes: {
              capacidade: bandeja.capacidade,
              fusoesExistentes: bandeja._count.fusoes
            }
          },
          { status: 400 }
        );
      }
    }

    // Se estiver alterando a caixa, verifica se a nova caixa existe e é do tipo CEO
    if (dadosAtualizacao.caixaId && dadosAtualizacao.caixaId !== acesso.fusao?.caixaId) {
      const caixa = await prisma.caixa.findUnique({
        where: { id: dadosAtualizacao.caixaId },
        select: {
          tipo: true,
          cidadeId: true,
        },
      });

      if (!caixa) {
        return NextResponse.json(
          { erro: "Caixa não encontrada" },
          { status: 404 }
        );
      }

      if (caixa.tipo !== "CEO") {
        return NextResponse.json(
          { erro: "Só é possível registrar fusões em caixas do tipo CEO" },
          { status: 400 }
        );
      }

      // Verifica se o usuário tem acesso à nova caixa
      const token = await verificarAutenticacao(req);
      if (token && token.cargo !== "Gerente") {
        const temAcesso = await prisma.cidade.findFirst({
          where: {
            id: caixa.cidadeId,
            usuarios: {
              some: {
                id: token.id as string,
              },
            },
          },
        });

        if (!temAcesso) {
          return NextResponse.json(
            { erro: "Você não tem acesso a esta caixa" },
            { status: 403 }
          );
        }
      }

      // Se estiver alterando a caixa, remove a bandeja (a menos que uma nova bandeja seja especificada)
      if (!dadosAtualizacao.bandejaId) {
        dadosAtualizacao.bandejaId = undefined
      }
    }

    // Atualiza a fusão no banco de dados
    const fusaoAtualizada = await prisma.fusao.update({
      where: { id },
      data: dadosAtualizacao,
    });

    // Registra a ação no log de auditoria
    if (acesso.token) {
      await registrarLog({
        prisma,
        usuarioId: acesso.token.id as string,
        acao: "Atualização",
        entidade: "Fusão",
        entidadeId: id,
        detalhes: dadosAtualizacao,
      });
    }

    return NextResponse.json({
      mensagem: "Fusão atualizada com sucesso",
      fusao: fusaoAtualizada,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * DELETE - Remove uma fusão específica
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (Técnicos, Engenheiros e Gerentes podem excluir fusões)
    const permissaoErro = await verificarPermissao(req, ["Técnico", "Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se o usuário tem acesso à fusão
    const acesso = await verificarAcessoFusao(req, id);
    if (acesso.erro) return acesso.erro;

    // Exclui a fusão do banco de dados
    const fusaoExcluida = await prisma.fusao.delete({
      where: { id },
    });

    // Registra a ação no log de auditoria
    if (acesso.token) {
      await registrarLog({
        prisma,
        usuarioId: acesso.token.id as string,
        acao: "Exclusão",
        entidade: "Fusão",
        entidadeId: id,
        detalhes: {
          capilarOrigemId: acesso.fusao?.capilarOrigemId,
          capilarDestinoId: acesso.fusao?.capilarDestinoId,
          tipoFusao: acesso.fusao?.tipoFusao,
          caixaId: acesso.fusao?.caixaId,
          bandejaId: acesso.fusao?.bandejaId,
        },
      });
    }

    return NextResponse.json({
      mensagem: "Fusão excluída com sucesso",
    });
  } catch (error) {
    return tratarErro(error);
  }
}