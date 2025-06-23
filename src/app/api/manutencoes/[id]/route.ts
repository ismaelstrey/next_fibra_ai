// src/app/api/manutencoes/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../../utils";
import { atualizarManutencaoSchema } from "../schema";

/**
 * Função auxiliar para verificar se o usuário tem acesso à manutenção
 */
async function verificarAcessoManutencao(req: NextRequest, manutencaoId: string) {
  const token = await verificarAutenticacao(req);
  if (!token) {
    return { erro: NextResponse.json({ erro: "Não autorizado" }, { status: 401 }) };
  }

  // Busca a manutenção com informações da caixa, rota e cidade
  const manutencao = await prisma.manutencao.findUnique({
    where: { id: manutencaoId },
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
      rota: token.cargo !== "Gerente" ? {
        select: {
          id: true,
          nome: true,
          tipoCabo: true,
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

  if (!manutencao) {
    return { erro: NextResponse.json({ erro: "Manutenção não encontrada" }, { status: 404 }) };
  }

  // Gerentes têm acesso a todas as manutenções
  if (token.cargo === "Gerente") {
    return { temAcesso: true, token, manutencao };
  }

  // Verifica se o usuário tem acesso à cidade da caixa ou rota
  let temAcesso = false;

  // if (manutencao.caixa && manutencao.caixa?.cidade?.usuarios?.length > 0) {
  //   temAcesso = true;
  // }

  // if (!temAcesso && manutencao.rota && manutencao.rota?.cidade?.usuarios?.length > 0) {
  //   temAcesso = true;
  // }

  // O usuário que criou a manutenção também tem acesso
  if (manutencao.usuarioId === token.id) {
    temAcesso = true;
  }

  if (!temAcesso) {
    return { erro: NextResponse.json({ erro: "Você não tem acesso a esta manutenção" }, { status: 403 }) };
  }

  return { temAcesso: true, token, manutencao };
}

/**
 * GET - Obtém detalhes de uma manutenção específica
 */
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;

    // Verifica se o usuário tem acesso à manutenção
    const acesso = await verificarAcessoManutencao(req, id);
    if (acesso.erro) return acesso.erro;

    // Retorna os detalhes da manutenção
    return NextResponse.json(acesso.manutencao);
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PATCH - Atualiza uma manutenção específica
 */
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (Técnicos, Engenheiros e Gerentes podem atualizar manutenções)
    const permissaoErro = await verificarPermissao(req, ["Técnico", "Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se o usuário tem acesso à manutenção
    const acesso = await verificarAcessoManutencao(req, id);
    if (acesso.erro) return acesso.erro;

    // Verifica se o usuário é o criador da manutenção ou um gerente
    const token = await verificarAutenticacao(req);
    if (token && token.cargo !== "Gerente" && acesso.manutencao?.usuarioId !== token.id) {
      return NextResponse.json(
        { erro: "Apenas o criador da manutenção ou um gerente pode atualizá-la" },
        { status: 403 }
      );
    }

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = atualizarManutencaoSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const dadosAtualizacao = result.data;

    // Se estiver alterando a caixa ou rota, verifica se o usuário tem acesso
    if (dadosAtualizacao.caixaId || dadosAtualizacao.rotaId) {
      const caixaId = dadosAtualizacao.caixaId || acesso.manutencao?.caixaId;
      const rotaId = dadosAtualizacao.rotaId || acesso.manutencao?.rotaId;

      const acessoEntidade = await verificarAcessoEntidade(req, caixaId, rotaId);
      if (acessoEntidade.erro) return acessoEntidade.erro;
    }

    // Converte as datas para objeto Date, se fornecidas
    if (dadosAtualizacao.dataManutencao) {
      dadosAtualizacao.dataManutencao = new Date(dadosAtualizacao.dataManutencao).toString();
    }

    if (dadosAtualizacao.dataInicio) {
      dadosAtualizacao.dataInicio = new Date(dadosAtualizacao.dataInicio).toString();
    }

    // Atualiza a manutenção no banco de dados
    const manutencaoAtualizada = await prisma.manutencao.update({
      where: { id },
      data: dadosAtualizacao,
    });

    // Registra a ação no log de auditoria
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Atualização",
        entidade: "Manutenção",
        entidadeId: id,
        detalhes: dadosAtualizacao,
      });
    }

    return NextResponse.json({
      mensagem: "Manutenção atualizada com sucesso",
      manutencao: manutencaoAtualizada,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * DELETE - Remove uma manutenção específica
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem excluir manutenções)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se o usuário tem acesso à manutenção
    const acesso = await verificarAcessoManutencao(req, id);
    if (acesso.erro) return acesso.erro;

    // Verifica se o usuário é o criador da manutenção ou um gerente
    const token = await verificarAutenticacao(req);
    if (token && token.cargo !== "Gerente" && acesso.manutencao?.usuarioId !== token.id) {
      return NextResponse.json(
        { erro: "Apenas o criador da manutenção ou um gerente pode excluí-la" },
        { status: 403 }
      );
    }

    // Exclui a manutenção do banco de dados
    const manutencaoExcluida = await prisma.manutencao.delete({
      where: { id },
    });

    // Registra a ação no log de auditoria
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Exclusão",
        entidade: "Manutenção",
        entidadeId: id,
        detalhes: {
          titulo: acesso.manutencao?.titulo,
          status: acesso.manutencao?.status,
          caixaId: acesso.manutencao?.caixaId,
          rotaId: acesso.manutencao?.rotaId,
        },
      });
    }

    return NextResponse.json({
      mensagem: "Manutenção excluída com sucesso",
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * Função auxiliar para verificar se o usuário tem acesso à caixa ou rota
 */
async function verificarAcessoEntidade(req: NextRequest, caixaId?: string | null, rotaId?: string | null) {
  const token = await verificarAutenticacao(req);
  if (!token) {
    return { erro: NextResponse.json({ erro: "Não autorizado" }, { status: 401 }) };
  }

  // Gerentes têm acesso a todas as entidades
  if (token.cargo === "Gerente") {
    return { temAcesso: true, token };
  }

  // Se foi especificada uma caixa, verifica se o usuário tem acesso
  if (caixaId) {
    const caixa = await prisma.caixa.findUnique({
      where: { id: caixaId },
      select: {
        id: true,
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
    });

    if (!caixa) {
      return { erro: NextResponse.json({ erro: "Caixa não encontrada" }, { status: 404 }) };
    }

    if (caixa.cidade.usuarios.length === 0) {
      return { erro: NextResponse.json({ erro: "Você não tem acesso a esta caixa" }, { status: 403 }) };
    }
  }

  // Se foi especificada uma rota, verifica se o usuário tem acesso
  if (rotaId) {
    const rota = await prisma.rota.findUnique({
      where: { id: rotaId },
      select: {
        id: true,
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
    });

    if (!rota) {
      return { erro: NextResponse.json({ erro: "Rota não encontrada" }, { status: 404 }) };
    }

    if (rota.cidade.usuarios.length === 0) {
      return { erro: NextResponse.json({ erro: "Você não tem acesso a esta rota" }, { status: 403 }) };
    }
  }

  return { temAcesso: true, token };
}