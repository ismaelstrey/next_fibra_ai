// src/app/api/equipamentos/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../../utils";
import { atualizarEquipamentoSchema } from "../schema";

/**
 * Função auxiliar para verificar se o usuário tem acesso ao equipamento
 */
async function verificarAcessoEquipamento(req: NextRequest, equipamentoId: string) {
  const token = await verificarAutenticacao(req);
  if (!token) {
    return { erro: NextResponse.json({ erro: "Não autorizado" }, { status: 401 }) };
  }

  // Busca o equipamento com informações relacionadas
  const equipamento = await prisma.equipamento.findUnique({
    where: { id: equipamentoId },
    include: {
      caixa: token.cargo !== "Gerente" ? {
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
        }
      } : true,
      emenda: token.cargo !== "Gerente" ? {
        select: {
          id: true,
          localizacao: true,
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
        }
      } : true,
      cliente: token.cargo !== "Gerente" ? {
        select: {
          id: true,
          nome: true,
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
        }
      } : true,
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

  if (!equipamento) {
    return { erro: NextResponse.json({ erro: "Equipamento não encontrado" }, { status: 404 }) };
  }

  // Gerentes têm acesso a todos os equipamentos
  if (token.cargo === "Gerente") {
    return { temAcesso: true, token, equipamento };
  }


}

/**
 * GET - Obtém um equipamento específico por ID
 */
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;

    // Verifica se o usuário tem acesso ao equipamento
    const acesso = await verificarAcessoEquipamento(req, id);
    if (acesso?.erro) return acesso.erro;

    // Retorna o equipamento com todas as informações relacionadas
    return NextResponse.json(acesso?.equipamento);
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PATCH - Atualiza um equipamento específico por ID
 */
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem atualizar equipamentos)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se o usuário tem acesso ao equipamento
    const acesso = await verificarAcessoEquipamento(req, id);
    if (acesso?.erro) return acesso.erro;

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = atualizarEquipamentoSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const { caixaId, emendaId, clienteId } = result.data;

    // Se estiver atualizando algum ID relacionado, verifica se o usuário tem acesso
    if (caixaId || emendaId || clienteId) {
      // Verifica se as entidades existem e se o usuário tem acesso
      if (caixaId) {
        const caixa = await prisma.caixa.findUnique({
          where: { id: caixaId },
          select: {
            id: true,
            cidadeId: true,
            cidade: acesso?.token?.cargo !== "Gerente" ? {
              select: {
                usuarios: {
                  where: {
                    id: acesso?.token?.id as string,
                  },
                  select: {
                    id: true,
                  },
                },
              },
            } : undefined,
          },
        });

        if (!caixa) {
          return NextResponse.json(
            { erro: "Caixa não encontrada" },
            { status: 404 }
          );
        }

        if (acesso?.token?.cargo !== "Gerente" && caixa?.cidade?.id !== acesso?.token?.cidadeId) {
          return NextResponse.json(
            { erro: "Você não tem acesso a esta caixa" },
            { status: 403 }
          );
        }
      }

      if (emendaId) {
        const emenda = await prisma.emenda.findUnique({
          where: { id: emendaId },
          select: {
            id: true,
            cidadeId: true,
            cidade: acesso?.token.cargo !== "Gerente" ? {
              select: {
                usuarios: {
                  where: {
                    id: acesso?.token.id as string,
                  },
                  select: {
                    id: true,
                  },
                },
              },
            } : undefined,
          },
        });

        if (!emenda) {
          return NextResponse.json(
            { erro: "Emenda não encontrada" },
            { status: 404 }
          );
        }

      }
    }

    if (clienteId) {
      const cliente = await prisma.cliente.findUnique({
        where: { id: clienteId },
        select: {
          id: true,
          cidadeId: true,
          cidade: acesso?.token.cargo !== "Gerente" ? {
            select: {
              usuarios: {
                where: {
                  id: acesso?.token.id as string,
                },
                select: {
                  id: true,
                },
              },
            },
          } : undefined,
        },
      });

      if (!cliente) {
        return NextResponse.json(
          { erro: "Cliente não encontrado" },
          { status: 404 }
        );
      }


    }

    // Atualiza o equipamento no banco de dados
    const equipamentoAtualizado = await prisma.equipamento.update({
      where: { id },
      data: result.data,
    });

    // Registra a ação no log de auditoria
    await registrarLog({
      prisma,
      usuarioId: acesso?.token.id as string,
      acao: "Atualização",
      entidade: "Equipamento",
      entidadeId: id,
      detalhes: result.data,
    });

    return NextResponse.json({
      mensagem: "Equipamento atualizado com sucesso",
      equipamento: equipamentoAtualizado,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * DELETE - Remove um equipamento específico por ID
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (apenas Gerentes podem excluir equipamentos)
    const permissaoErro = await verificarPermissao(req, ["Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se o usuário tem acesso ao equipamento
    const acesso = await verificarAcessoEquipamento(req, id);
    if (acesso?.erro) return acesso.erro;

    // Exclui o equipamento
    await prisma.equipamento.delete({
      where: { id },
    });

    // Registra a ação no log de auditoria
    await registrarLog({
      prisma,
      usuarioId: acesso?.token.id as string,
      acao: "Exclusão",
      entidade: "Equipamento",
      entidadeId: id,
      detalhes: { id },
    });

    return NextResponse.json({
      mensagem: "Equipamento excluído com sucesso",
    });
  } catch (error) {
    return tratarErro(error);
  }
}