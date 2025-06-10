// src/app/api/estatisticas/atividade/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarAutenticacao, tratarErro } from "../../utils";
import { registroAtividadeSchema } from "../schema";

/**
 * POST - Registra uma nova atividade de usuário no sistema
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica autenticação
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const usuarioId = token.sub as string;

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = registroAtividadeSchema.safeParse({
      ...body,
      usuarioId, // Garante que a atividade é registrada para o usuário autenticado
    });

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const { tipo, entidade, entidadeId, detalhes } = result.data;

    // Registra a atividade no banco de dados
    const atividade = await prisma.atividade.create({
      data: {
        usuarioId,
        tipo,
        entidade,
        entidadeId,
        detalhes,
      },
    });

    // Retorna a atividade registrada
    return NextResponse.json({
      mensagem: "Atividade registrada com sucesso",
      atividade,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * GET - Lista atividades do usuário autenticado com filtros
 */
export async function GET(req: NextRequest) {
  try {
    // Verifica autenticação
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const usuarioId = token.sub as string;
    const ehGerente = token.cargo === "Gerente";

    // Extrai parâmetros de consulta
    const url = new URL(req.url);
    const tipo = url.searchParams.get("tipo") || undefined;
    const entidade = url.searchParams.get("entidade") || undefined;
    const entidadeId = url.searchParams.get("entidadeId") || undefined;
    const dataInicio = url.searchParams.get("dataInicio") || undefined;
    const dataFim = url.searchParams.get("dataFim") || undefined;
    const usuarioIdParam = url.searchParams.get("usuarioId") || undefined;
    const pagina = Number(url.searchParams.get("pagina")) || 1;
    const itensPorPagina = Number(url.searchParams.get("itensPorPagina")) || 10;

    // Constrói o filtro para a consulta
    const filtro: any = {};

    // Se não for gerente, só pode ver suas próprias atividades
    if (!ehGerente) {
      filtro.usuarioId = usuarioId;
    } else if (usuarioIdParam) {
      // Se for gerente e especificou um usuário, filtra por esse usuário
      filtro.usuarioId = usuarioIdParam;
    }

    // Filtro por tipo
    if (tipo) {
      filtro.tipo = tipo;
    }

    // Filtro por entidade
    if (entidade) {
      filtro.entidade = entidade;
    }

    // Filtro por ID de entidade
    if (entidadeId) {
      filtro.entidadeId = entidadeId;
    }

    // Filtro por período
    if (dataInicio || dataFim) {
      filtro.criadoEm = {};

      if (dataInicio) {
        filtro.criadoEm.gte = new Date(dataInicio);
      }

      if (dataFim) {
        filtro.criadoEm.lte = new Date(dataFim);
      }
    }

    // Calcula o total de registros
    const total = await prisma.atividade.count({ where: filtro });

    // Calcula o total de páginas
    const totalPaginas = Math.ceil(total / itensPorPagina);

    // Busca as atividades com paginação
    const atividades = await prisma.atividade.findMany({
      where: filtro,
      select: {
        id: true,
        tipo: true,
        entidade: true,
        entidadeId: true,
        detalhes: true,
        criadoEm: true,
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
      orderBy: {
        criadoEm: "desc",
      },
      skip: (pagina - 1) * itensPorPagina,
      take: itensPorPagina,
    });

    // Retorna as atividades com informações de paginação
    return NextResponse.json({
      atividades,
      paginacao: {
        total,
        totalPaginas,
        paginaAtual: pagina,
        itensPorPagina,
      },
    });
  } catch (error) {
    return tratarErro(error);
  }
}