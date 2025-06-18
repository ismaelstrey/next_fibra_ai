// src/app/api/caixas/[id]/bandejas/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../../../utils";
import { atualizarBandejasEmLoteSchema } from "./schema";

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
    return { temAcesso: true, token };
  }

  // Verifica se o usuário tem acesso à cidade da caixa
  const caixa = await prisma.caixa.findUnique({
    where: { id: caixaId },
    select: {
      cidadeId: true,
      tipo: true,
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

  if (caixa.tipo !== "CEO") {
    return { erro: NextResponse.json({ erro: "Esta caixa não possui bandejas" }, { status: 400 }) };
  }

  if (caixa.cidade.usuarios.length === 0) {
    return { erro: NextResponse.json({ erro: "Você não tem acesso a esta caixa" }, { status: 403 }) };
  }

  return { temAcesso: true, token };
}

/**
 * GET - Lista todas as bandejas de uma caixa específica
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Verifica se o usuário tem acesso à caixa
    const acesso = await verificarAcessoCaixa(req, id);
    if ('erro' in acesso) return acesso.erro;

    // Busca a caixa para verificar se é do tipo CEO
    const caixa = await prisma.caixa.findUnique({
      where: { id },
      select: {
        tipo: true,
        nome: true,
        capacidade: true,
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
        { erro: "Esta caixa não possui bandejas" },
        { status: 400 }
      );
    }

    // Consulta as bandejas da caixa
    const bandejas = await prisma.bandeja.findMany({
      where: { caixaId: id },
      include: {
        _count: {
          select: {
            fusoes: true,
          },
        },
      },
      orderBy: { numero: "asc" },
    });

    // Calcula estatísticas
    const totalCapacidade = bandejas.reduce((sum, b) => sum + b.capacidade, 0);
    const totalFusoes = bandejas.reduce((sum, b) => sum + b._count.fusoes, 0);

    const estatisticas = {
      totalBandejas: bandejas.length,
      totalCapacidade,
      totalFusoes,
      disponivel: totalCapacidade - totalFusoes,
    };

    return NextResponse.json({
      caixa: {
        id,
        nome: caixa.nome,
        capacidade: caixa.capacidade,
      },
      bandejas,
      estatisticas,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PUT - Atualiza múltiplas bandejas de uma caixa em lote
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem atualizar bandejas)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = await params;

    // Verifica se o usuário tem acesso à caixa
    const acesso = await verificarAcessoCaixa(req, id);
    if ('erro' in acesso) return acesso.erro;

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = atualizarBandejasEmLoteSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const { bandejas } = result.data;

    // Verifica se todas as bandejas pertencem à caixa especificada
    const bandejasIds = bandejas.map(b => b.id);
    const bandejasExistentes = await prisma.bandeja.findMany({
      where: {
        id: { in: bandejasIds },
        caixaId: id,
      },
      include: {
        _count: {
          select: {
            fusoes: true,
          },
        },
      },
    });

    if (bandejasExistentes.length !== bandejasIds.length) {
      return NextResponse.json(
        { erro: "Uma ou mais bandejas não pertencem à caixa especificada" },
        { status: 400 }
      );
    }

    // Verifica se alguma bandeja tem capacidade menor que o número de fusões
    const bandejasInvalidas = [];
    for (const bandeja of bandejas) {
      const bandejaExistente = bandejasExistentes.find(b => b.id === bandeja.id);
      if (bandeja.capacidade && bandejaExistente && bandeja.capacidade < bandejaExistente._count.fusoes) {
        bandejasInvalidas.push({
          id: bandeja.id,
          capacidadeSolicitada: bandeja.capacidade,
          fusoesExistentes: bandejaExistente._count.fusoes,
        });
      }
    }

    if (bandejasInvalidas.length > 0) {
      return NextResponse.json(
        { 
          erro: "Não é possível reduzir a capacidade de bandejas que possuem fusões", 
          detalhes: bandejasInvalidas 
        },
        { status: 400 }
      );
    }

    // Atualiza cada bandeja
    const atualizacoes = bandejas.map(bandeja => {
      const { id: bandejaId, ...dadosAtualizacao } = bandeja;
      return prisma.bandeja.update({
        where: { id: bandejaId },
        data: dadosAtualizacao,
      });
    });

    const bandejasAtualizadas = await prisma.$transaction(atualizacoes);

    // Registra a ação no log de auditoria
    if ('token' in acesso && acesso.token) {
      await registrarLog({
        prisma,
        usuarioId: acesso.token.id as string,
        acao: "Atualização em Lote",
        entidade: "Bandejas",
        entidadeId: id, // ID da caixa
        detalhes: { bandejasAtualizadas: bandejasIds },
      });
    }

    return NextResponse.json({
      mensagem: `${bandejasAtualizadas.length} bandejas atualizadas com sucesso`,
      bandejas: bandejasAtualizadas,
    });
  } catch (error) {
    return tratarErro(error);
  }
}