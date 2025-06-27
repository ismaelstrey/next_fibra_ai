// src/app/api/caixas/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../../utils";
import { atualizarCaixaSchema } from "../schema";

/**
 * Função auxiliar para verificar se o usuário tem acesso à caixa
 */
async function verificarAcessoCaixa(req: NextRequest, caixaId: string) {
  const token = await verificarAutenticacao(req);
  if (!token) {
    return NextResponse.json(
      { erro: "Não autorizado" },
      { status: 401 }
    );
  }

  // Gerentes têm acesso a todas as caixas
  if (token.cargo === "Gerente") {
    return null;
  }

  // Verifica se o usuário tem acesso à cidade da caixa
  const caixa = await prisma.caixa.findUnique({
    where: { id: caixaId },
    select: {
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
    return NextResponse.json(
      { erro: "Caixa não encontrada" },
      { status: 404 }
    );
  }

  // if (caixa.cidade.usuarios.length === 0) {
  //   return NextResponse.json(
  //     { erro: "Você não tem acesso a esta caixa [cidade]" },
  //     { status: 403 }
  //   );
  // }

  return null;
}

/**
 * GET - Obtém uma caixa específica por ID
 */
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    console.log(id)

    // Verifica se o usuário tem acesso à caixa
    const acessoErro = await verificarAcessoCaixa(req, id);
    if (acessoErro) return acessoErro;

    // Busca a caixa com todas as informações relacionadas
    const caixa = await prisma.caixa.findUnique({
      where: { id },
      include: {
        cidade: {
          select: {
            id: true,
            nome: true,
            estado: true,
          },
        },
        rotaCaixas: {
          select: {
            tipoConexao: true,
            ordem: true,
            rota: {
              select: {
                id: true,
                nome: true,
                tipoCabo: true,
                fabricante: true,
              },
            },
          },
        },
        portas: {
          
          orderBy: { numero: "asc" },
        },
        bandejas: {
          orderBy: { numero: "asc" },
        },
        fusoes: {
          include: {
            bandeja: true,
          },
        },
        comentarios: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
                imagem: true,
              },
            },
          },
          orderBy: { criadoEm: "desc" },
        },
        arquivos: {
          orderBy: { criadoEm: "desc" },
        },
        spliters:true,
        manutencoes: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
                imagem: true,
              },
            },
          },
          orderBy: { atualizadoEm: "desc" },
        },
        _count: {
          select: {
            fusoes: true,
            portas: true,
            bandejas: true,
            comentarios: true,
            arquivos: true,
            manutencoes: true,
          },
        },
      },
    });

    if (!caixa) {
      return NextResponse.json(
        { erro: "Caixa não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(caixa);
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PATCH - Atualiza uma caixa específica por ID
 */
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem atualizar caixas)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se a caixa existe
    const caixaExistente = await prisma.caixa.findUnique({
      where: { id },
      select: {
        id: true,
        cidadeId: true,
        tipo: true,
        capacidade: true,
      },
    });

    if (!caixaExistente) {
      return NextResponse.json(
        { erro: "Caixa não encontrada" },
        { status: 404 }
      );
    }

    // Verifica se o usuário tem acesso à caixa
    const acessoErro = await verificarAcessoCaixa(req, id);
    if (acessoErro) return acessoErro;

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = atualizarCaixaSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const dadosAtualizacao = result.data;

    // Se estiver alterando a cidade, verifica se a cidade existe
    if (dadosAtualizacao.cidadeId && dadosAtualizacao.cidadeId !== caixaExistente.cidadeId) {
      const cidade = await prisma.cidade.findUnique({
        where: { id: dadosAtualizacao.cidadeId },
      });

      if (!cidade) {
        return NextResponse.json(
          { erro: "Cidade não encontrada" },
          { status: 404 }
        );
      }

      // Verifica se o usuário tem acesso à nova cidade
      const token = await verificarAutenticacao(req);
      if (token && token.cargo !== "Gerente") {
        const temAcesso = await prisma.cidade.findFirst({
          where: {
            id: dadosAtualizacao.cidadeId,
            usuarios: {
              some: {
                id: token.id as string,
              },
            },
          },
        });

        if (!temAcesso) {
          return NextResponse.json(
            { erro: "Você não tem acesso a esta cidade" },
            { status: 403 }
          );
        }
      }
    }

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

      // Verifica se a rota pertence à cidade da caixa (ou à nova cidade, se estiver sendo alterada)
      const cidadeId = dadosAtualizacao.cidadeId || caixaExistente.cidadeId;
      if (rota.cidadeId !== cidadeId) {
        return NextResponse.json(
          { erro: "A rota não pertence à cidade especificada" },
          { status: 400 }
        );
      }
    }

    // Verifica se está alterando o tipo da caixa
    if (dadosAtualizacao.tipo && dadosAtualizacao.tipo !== caixaExistente.tipo) {
      // Verifica se existem portas ou bandejas associadas
      const [portasCount, bandejasCount] = await Promise.all([
        prisma.porta.count({ where: { caixaId: id } }),
        prisma.bandeja.count({ where: { caixaId: id } }),
      ]);

      if (portasCount > 0 || bandejasCount > 0) {
        return NextResponse.json(
          { erro: "Não é possível alterar o tipo da caixa porque existem portas ou bandejas associadas" },
          { status: 400 }
        );
      }
    }

    // Verifica se está alterando a capacidade
    if (dadosAtualizacao.capacidade && dadosAtualizacao.capacidade !== caixaExistente.capacidade) {
      // Verifica o tipo atual da caixa
      if (caixaExistente.tipo === "CTO") {
        // Para CTO, verifica se existem portas em uso
        const portasEmUso = await prisma.porta.count({
          where: {
            caixaId: id,
            status: { not: "Livre" },
          },
        });

        if (portasEmUso > 0 && dadosAtualizacao.capacidade < portasEmUso) {
          return NextResponse.json(
            { erro: `Não é possível reduzir a capacidade para ${dadosAtualizacao.capacidade} porque existem ${portasEmUso} portas em uso` },
            { status: 400 }
          );
        }
      } else if (caixaExistente.tipo === "CEO") {
        // Para CEO, verifica se existem fusões
        const fusoesCount = await prisma.fusao.count({
          where: {
            caixaId: id,
          },
        });

        if (fusoesCount > 0 && dadosAtualizacao.capacidade < fusoesCount) {
          return NextResponse.json(
            { erro: `Não é possível reduzir a capacidade para ${dadosAtualizacao.capacidade} porque existem ${fusoesCount} fusões registradas` },
            { status: 400 }
          );
        }
      }
    }

    // Atualiza a caixa no banco de dados
    const caixaAtualizada = await prisma.caixa.update({
      where: { id },
      data: dadosAtualizacao,
    });

    // Se alterou o tipo ou a capacidade, atualiza as portas ou bandejas
    if (
      (dadosAtualizacao.tipo && dadosAtualizacao.tipo !== caixaExistente.tipo) ||
      (dadosAtualizacao.capacidade && dadosAtualizacao.capacidade !== caixaExistente.capacidade)
    ) {
      // Se alterou para CTO ou manteve CTO e alterou capacidade
      if (dadosAtualizacao.tipo === "CTO" || (caixaExistente.tipo === "CTO" && dadosAtualizacao.capacidade)) {
        // Remove todas as bandejas se existirem (caso esteja mudando de CEO para CTO)
        await prisma.bandeja.deleteMany({
          where: { caixaId: id },
        });

        // Obtém a nova capacidade
        const novaCapacidade = dadosAtualizacao.capacidade || caixaExistente.capacidade;

        // Remove todas as portas existentes
        await prisma.porta.deleteMany({
          where: { caixaId: id },
        });

        // Cria novas portas de acordo com a capacidade
        const portas = Array.from({ length: novaCapacidade }, (_, i) => ({
          numero: i + 1,
          status: "Livre",
          caixaId: id,
        }));

        await prisma.porta.createMany({
          data: portas,
        });
      }
      // Se alterou para CEO ou manteve CEO e alterou capacidade
      else if (dadosAtualizacao.tipo === "CEO" || (caixaExistente.tipo === "CEO" && dadosAtualizacao.capacidade)) {
        // Remove todas as portas se existirem (caso esteja mudando de CTO para CEO)
        await prisma.porta.deleteMany({
          where: { caixaId: id },
        });

        // Obtém a nova capacidade
        const novaCapacidade = dadosAtualizacao.capacidade || caixaExistente.capacidade;

        // Remove todas as bandejas existentes
        await prisma.bandeja.deleteMany({
          where: { caixaId: id },
        });

        // Cria novas bandejas de acordo com a capacidade (assumindo 1 bandeja para cada 12 fibras)
        const numBandejas = Math.ceil(novaCapacidade / 12);
        const bandejas = Array.from({ length: numBandejas }, (_, i) => ({
          numero: i + 1,
          capacidade: i === numBandejas - 1 && novaCapacidade % 12 !== 0 ? novaCapacidade % 12 : 12,
          caixaId: id,
        }));

        await prisma.bandeja.createMany({
          data: bandejas,
        });
      }
    }

    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Atualização",
        entidade: "Caixa",
        entidadeId: id,
        detalhes: dadosAtualizacao,
      });
    }

    return NextResponse.json({
      mensagem: "Caixa atualizada com sucesso",
      caixa: caixaAtualizada,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * DELETE - Remove uma caixa específica por ID
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (apenas Gerentes podem excluir caixas)
    const permissaoErro = await verificarPermissao(req, ["Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se a caixa existe
    const caixa = await prisma.caixa.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        tipo: true,
        _count: {
          select: {
            portas: true,
            bandejas: true,
            fusoes: true,
            manutencoes: true,
            comentarios: true,
            arquivos: true,
          },
        },
      },
    });

    if (!caixa) {
      return NextResponse.json(
        { erro: "Caixa não encontrada" },
        { status: 404 }
      );
    }

    // Verifica se existem portas em uso
    if (caixa.tipo === "CTO") {
      const portasEmUso = await prisma.porta.count({
        where: {
          caixaId: id,
          status: { not: "Livre" },
        },
      });

      if (portasEmUso > 0) {
        return NextResponse.json(
          { erro: `Não é possível excluir a caixa porque existem ${portasEmUso} portas em uso` },
          { status: 400 }
        );
      }
    }

    // Verifica se existem fusões
    if (caixa._count.fusoes > 0) {
      return NextResponse.json(
        { erro: `Não é possível excluir a caixa porque existem ${caixa._count.fusoes} fusões registradas` },
        { status: 400 }
      );
    }

    // Exclui todos os registros relacionados
    await prisma.$transaction([
      // Exclui portas
      prisma.porta.deleteMany({
        where: { caixaId: id },
      }),
      // Exclui bandejas
      prisma.bandeja.deleteMany({
        where: { caixaId: id },
      }),
      // Exclui manutenções
      prisma.manutencao.deleteMany({
        where: { caixaId: id },
      }),
      // Exclui comentários
      prisma.comentario.deleteMany({
        where: { caixaId: id },
      }),
      // Exclui arquivos
      prisma.arquivo.deleteMany({
        where: { caixaId: id },
      }),
      // Exclui a caixa
      prisma.caixa.delete({
        where: { id },
      }),
    ]);

    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Exclusão",
        entidade: "Caixa",
        entidadeId: id,
        detalhes: { nome: caixa.nome, tipo: caixa.tipo },
      });
    }

    return NextResponse.json({
      mensagem: "Caixa excluída com sucesso",
    });
  } catch (error) {
    return tratarErro(error);
  }
}