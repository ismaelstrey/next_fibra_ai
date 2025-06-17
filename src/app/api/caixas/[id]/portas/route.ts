// src/app/api/caixas/[id]/portas/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../../../utils";
import { atualizarPortasEmLoteSchema } from "./schema";

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

  if (caixa.tipo !== "CTO") {
    return { erro: NextResponse.json({ erro: "Esta caixa não possui portas" }, { status: 400 }) };
  }

  if (caixa.cidade.usuarios.length === 0) {
    return { erro: NextResponse.json({ erro: "Você não tem acesso a esta caixa" }, { status: 403 }) };
  }

  return { temAcesso: true, token };
}

/**
 * GET - Lista todas as portas de uma caixa específica
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Verifica se o usuário tem acesso à caixa
    const acesso = await verificarAcessoCaixa(req, id);
    if ('erro' in acesso) return acesso.erro;

    // Obtém parâmetros de consulta
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // Livre, Ocupada, Reservada, Defeito

    // Constrói o filtro
    const where: { caixaId: string; status?: string } = { caixaId: id };
    
    // Adiciona filtro por status
    if (status) {
      where.status = status;
    }

    // Busca a caixa para verificar se é do tipo CTO
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

    if (caixa.tipo !== "CTO") {
      return NextResponse.json(
        { erro: "Esta caixa não possui portas" },
        { status: 400 }
      );
    }

    // Consulta as portas da caixa
    const portas = await prisma.porta.findMany({
      where,
      orderBy: { numero: "asc" },
    });

    // Calcula estatísticas
    const estatisticas = {
      total: portas.length,
      livres: portas.filter(p => p.status === "Livre").length,
      ocupadas: portas.filter(p => p.status === "Ocupada").length,
      reservadas: portas.filter(p => p.status === "Reservada").length,
      defeito: portas.filter(p => p.status === "Defeito").length,
    };

    return NextResponse.json({
      caixa: {
        id,
        nome: caixa.nome,
        capacidade: caixa.capacidade,
      },
      portas,
      estatisticas,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PUT - Atualiza múltiplas portas de uma caixa em lote
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verifica se o usuário tem permissão (Técnicos, Engenheiros e Gerentes podem atualizar portas)
    const permissaoErro = await verificarPermissao(req, ["Técnico", "Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se o usuário tem acesso à caixa
    const acesso = await verificarAcessoCaixa(req, id);
    if ('erro' in acesso) return acesso.erro;

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = atualizarPortasEmLoteSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const { portas } = result.data;

    // Verifica se todas as portas pertencem à caixa especificada
    const portasIds = portas.map(p => p.id);
    const portasExistentes = await prisma.porta.findMany({
      where: {
        id: { in: portasIds },
        caixaId: id,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (portasExistentes.length !== portasIds.length) {
      return NextResponse.json(
        { erro: "Uma ou mais portas não pertencem à caixa especificada" },
        { status: 400 }
      );
    }

    // Atualiza cada porta
    const atualizacoes = portas.map(porta => {
      const { id: portaId, ...dadosAtualizacao } = porta;
      return prisma.porta.update({
        where: { id: portaId },
        data: dadosAtualizacao,
      });
    });

    const portasAtualizadas = await prisma.$transaction(atualizacoes);

    // Registra a ação no log de auditoria
    if ('token' in acesso && acesso.token) {
      await registrarLog({
        prisma,
        usuarioId: acesso.token.id as string,
        acao: "Atualização em Lote",
        entidade: "Portas",
        entidadeId: id, // ID da caixa
        detalhes: { portasAtualizadas: portasIds },
      });
    }

    return NextResponse.json({
      mensagem: `${portasAtualizadas.length} portas atualizadas com sucesso`,
      portas: portasAtualizadas,
    });
  } catch (error) {
    return tratarErro(error);
  }
}