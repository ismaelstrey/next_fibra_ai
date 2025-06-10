// src/app/api/relatorios/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../../utils";
import { atualizarRelatorioSchema } from "../schema";

/**
 * Função auxiliar para verificar se o usuário tem acesso ao relatório
 */
async function verificarAcessoRelatorio(req: NextRequest, relatorioId: string) {
  const token = await verificarAutenticacao(req);
  if (!token) {
    return { erro: NextResponse.json({ erro: "Não autorizado" }, { status: 401 }) };
  }

  // Busca o relatório
  const relatorio = await prisma.relatorio.findUnique({
    where: { id: relatorioId },
    select: {
      id: true,
      titulo: true,
      criadorId: true,
      cidadeId: true,
      caixaId: true,
      rotaId: true,
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
      caixa: {
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
      },
      rota: {
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
      },
    },
  });

  if (!relatorio) {
    return { erro: NextResponse.json({ erro: "Relatório não encontrado" }, { status: 404 }) };
  }

  // Verifica se o usuário é o criador do relatório
  const ehCriador = relatorio.criadorId === token.id;

  // Gerentes têm acesso a todos os relatórios
  if (token.cargo === "Gerente") {
    return { temAcesso: true, token, relatorio, ehCriador };
  }

  // Engenheiros têm acesso a todos os relatórios das cidades que têm acesso
  if (token.cargo === "Engenheiro") {
    // Verifica acesso pela cidade diretamente associada ao relatório
    if (relatorio.cidade && relatorio.cidade.usuarios.length > 0) {
      return { temAcesso: true, token, relatorio, ehCriador };
    }

    // Verifica acesso pela cidade da caixa associada ao relatório
    if (relatorio.caixa && relatorio.caixa.cidade.usuarios.length > 0) {
      return { temAcesso: true, token, relatorio, ehCriador };
    }

    // Verifica acesso pela cidade da rota associada ao relatório
    if (relatorio.rota && relatorio.rota.cidade.usuarios.length > 0) {
      return { temAcesso: true, token, relatorio, ehCriador };
    }
  }

  // Técnicos só têm acesso se forem os criadores
  if (token.cargo === "Técnico" && ehCriador) {
    return { temAcesso: true, token, relatorio, ehCriador };
  }

  return { erro: NextResponse.json({ erro: "Você não tem acesso a este relatório" }, { status: 403 }) };
}

/**
 * Função auxiliar para verificar se o usuário tem acesso à entidade (caixa, rota, cidade)
 */
async function verificarAcessoEntidade(req: NextRequest, cidadeId?: string, caixaId?: string, rotaId?: string) {
  const token = await verificarAutenticacao(req);
  if (!token) {
    return { erro: NextResponse.json({ erro: "Não autorizado" }, { status: 401 }) };
  }

  // Gerentes têm acesso a todas as entidades
  if (token.cargo === "Gerente") {
    return { temAcesso: true, token };
  }

  // Se foi especificada uma cidade, verifica se o usuário tem acesso
  if (cidadeId) {
    const cidade = await prisma.cidade.findUnique({
      where: { id: cidadeId },
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
    });

    if (!cidade) {
      return { erro: NextResponse.json({ erro: "Cidade não encontrada" }, { status: 404 }) };
    }

    if (cidade.usuarios.length === 0) {
      return { erro: NextResponse.json({ erro: "Você não tem acesso a esta cidade" }, { status: 403 }) };
    }
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

/**
 * GET - Obtém detalhes de um relatório específico
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Verifica se o usuário tem acesso ao relatório
    const acesso = await verificarAcessoRelatorio(req, id);
    if (acesso.erro) return acesso.erro;

    // Busca os detalhes completos do relatório
    const relatorio = await prisma.relatorio.findUnique({
      where: { id },
      select: {
        id: true,
        titulo: true,
        descricao: true,
        tipo: true,
        dataInicio: true,
        dataFim: true,
        dados: true,
        observacoes: true,
        criadoEm: true,
        atualizadoEm: true,
        cidadeId: true,
        caixaId: true,
        rotaId: true,
        manutencaoId: true,
        criadorId: true,
        criador: {
          select: {
            id: true,
            nome: true,
            email: true,
            cargo: true,
            imagem: true,
          },
        },
        cidade: {
          select: {
            id: true,
            nome: true,
            estado: true,
          },
        },
        caixa: {
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
        },
        rota: {
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
        },
        manutencao: {
          select: {
            id: true,
            titulo: true,
            status: true,
            tipo: true,
          },
        },
      },
    });

    return NextResponse.json(relatorio);
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PATCH - Atualiza um relatório específico
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Verifica se o usuário tem acesso ao relatório
    const acesso = await verificarAcessoRelatorio(req, id);
    if (acesso.erro) return acesso.erro;

    // Apenas o criador do relatório, engenheiros ou gerentes podem atualizar o relatório
    if (!acesso.ehCriador && !(await verificarPermissao(req, ["Engenheiro", "Gerente"]))) {
      return NextResponse.json(
        { erro: "Você não tem permissão para atualizar este relatório" },
        { status: 403 }
      );
    }

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = atualizarRelatorioSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const {
      titulo,
      descricao,
      tipo,
      dataInicio,
      dataFim,
      dados,
      cidadeId,
      caixaId,
      rotaId,
      manutencaoId,
      observacoes
    } = result.data;

    // Se estiver alterando entidades relacionadas, verifica se o usuário tem acesso
    if (cidadeId || caixaId || rotaId) {
      const acessoEntidade = await verificarAcessoEntidade(
        req,
        cidadeId || acesso.relatorio?.cidadeId || '',
        caixaId || acesso.relatorio?.caixaId || '',
        rotaId || acesso.relatorio?.rotaId || ''
      );
      if (acessoEntidade.erro) return acessoEntidade.erro;
    }

    // Verifica se a manutenção existe, se especificada
    if (manutencaoId) {
      const manutencaoExiste = await prisma.manutencao.findUnique({
        where: { id: manutencaoId },
      });

      if (!manutencaoExiste) {
        return NextResponse.json(
          { erro: "Manutenção não encontrada" },
          { status: 404 }
        );
      }
    }

    // Prepara os dados para atualização
    const dadosAtualizacao: any = {};

    if (titulo !== undefined) dadosAtualizacao.titulo = titulo;
    if (descricao !== undefined) dadosAtualizacao.descricao = descricao;
    if (tipo !== undefined) dadosAtualizacao.tipo = tipo;
    if (dataInicio !== undefined) dadosAtualizacao.dataInicio = new Date(dataInicio);
    if (dataFim !== undefined) dadosAtualizacao.dataFim = new Date(dataFim);
    if (dados !== undefined) dadosAtualizacao.dados = dados;
    if (cidadeId !== undefined) dadosAtualizacao.cidadeId = cidadeId;
    if (caixaId !== undefined) dadosAtualizacao.caixaId = caixaId;
    if (rotaId !== undefined) dadosAtualizacao.rotaId = rotaId;
    if (manutencaoId !== undefined) dadosAtualizacao.manutencaoId = manutencaoId;
    if (observacoes !== undefined) dadosAtualizacao.observacoes = observacoes;

    // Atualiza o relatório no banco de dados
    const relatorioAtualizado = await prisma.relatorio.update({
      where: { id },
      data: dadosAtualizacao,
    });

    // Registra a ação no log de auditoria
    if (acesso.token) {
      await registrarLog({
        prisma,
        usuarioId: acesso.token.id as string,
        acao: "Atualização",
        entidade: "Relatório",
        entidadeId: id,
        detalhes: { titulo, tipo },
      });
    }

    // Retorna os dados do relatório atualizado
    return NextResponse.json({
      mensagem: "Relatório atualizado com sucesso",
      relatorio: relatorioAtualizado,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * DELETE - Remove um relatório específico
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Verifica se o usuário tem acesso ao relatório
    const acesso = await verificarAcessoRelatorio(req, id);
    if (acesso.erro) return acesso.erro;

    // Apenas o criador do relatório ou um gerente pode excluir o relatório
    if (!acesso.ehCriador && acesso.token?.cargo !== "Gerente") {
      return NextResponse.json(
        { erro: "Você não tem permissão para excluir este relatório" },
        { status: 403 }
      );
    }

    // Remove o relatório do banco de dados
    await prisma.relatorio.delete({
      where: { id },
    });

    // Registra a ação no log de auditoria
    if (acesso.token) {
      await registrarLog({
        prisma,
        usuarioId: acesso.token.id as string,
        acao: "Exclusão",
        entidade: "Relatório",
        entidadeId: id,
        detalhes: { id },
      });
    }

    // Retorna mensagem de sucesso
    return NextResponse.json({
      mensagem: "Relatório excluído com sucesso",
    });
  } catch (error) {
    return tratarErro(error);
  }
}