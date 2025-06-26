// src/app/api/spliters/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../utils";
import { spliterSchema } from "./schema";

/**
 * GET - Lista todos os spliters com paginação e filtros
 */
export async function GET(req: NextRequest) {
  try {
    // Verifica se o usuário está autenticado
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json(
        { erro: "Não autorizado" },
        { status: 401 }
      );
    }

    // Obtém parâmetros de consulta
    const { searchParams } = new URL(req.url);
    const pagina = parseInt(searchParams.get("pagina") || "1");
    const limite = parseInt(searchParams.get("limite") || "10");
    const busca = searchParams.get("busca") || "";
    const tipo = searchParams.get("tipo");
    const caixaId = searchParams.get("caixaId");
    const capilarSaidaId = searchParams.get("capilarSaidaId");
    const capilarEntradaId = searchParams.get("capilarEntradaId");
    const atendimento = searchParams.get("atendimento") === "true" ? true : 
                       searchParams.get("atendimento") === "false" ? false : undefined;

    // Calcula o offset para paginação
    const skip = (pagina - 1) * limite;

    // Constrói o filtro
    const where: any = {};

    // Adiciona filtro de busca por nome
    if (busca) {
      where.OR = [
        { nome: { contains: busca, mode: "insensitive" } },
        { tipo: { contains: busca, mode: "insensitive" } },
      ];
    }

    // Adiciona filtro por tipo
    if (tipo) {
      where.tipo = tipo;
    }

    // Adiciona filtro por caixa
    if (caixaId) {
      where.caixaId = caixaId;
    }

    // Adiciona filtro por capilar de saída
    if (capilarSaidaId) {
      where.capilarSaidaId = capilarSaidaId;
    }

    // Adiciona filtro por capilar de entrada
    if (capilarEntradaId) {
      where.capilarEntradaId = capilarEntradaId;
    }

    // Adiciona filtro por atendimento
    if (atendimento !== undefined) {
      where.atendimento = atendimento;
    }

    // Consulta os spliters com paginação e filtros
    const [spliters, total] = await Promise.all([
      prisma.spliter.findMany({
        where,
        select: {
          id: true,
          nome: true,
          atendimento: true,
          tipo: true,
          caixaId: true,
          capilarSaidaId: true,
          capilarEntradaId: true,
          caixa: {
            select: {
              id: true,
              nome: true,
              tipo: true,
            },
          },
          capilarSaida: {
            select: {
              id: true,
              numero: true,
              tipo: true,
              status: true,
            },
          },
          capilarEntrada: {
            select: {
              id: true,
              numero: true,
              tipo: true,
              status: true,
            },
          },
        },
        skip,
        take: limite,
        orderBy: { nome: "asc" },
      }),
      prisma.spliter.count({ where }),
    ]);

    // Calcula metadados de paginação
    const totalPaginas = Math.ceil(total / limite);

    return NextResponse.json({
      spliters,
      paginacao: {
        total,
        pagina,
        limite,
        totalPaginas,
      },
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * POST - Cria um novo spliter
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem criar spliters)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = spliterSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const {
      nome,
      atendimento,
      tipo,
      caixaId,
      capilarSaidaId,
      capilarEntradaId
    } = result.data;

    // Verifica se a caixa existe
    const caixa = await prisma.caixa.findUnique({
      where: { id: caixaId },
    });

    if (!caixa) {
      return NextResponse.json(
        { erro: "Caixa não encontrada" },
        { status: 404 }
      );
    }

    // Verifica se os capilares existem
    const [capilarSaida, capilarEntrada] = await Promise.all([
      capilarSaidaId ? prisma.capilar.findUnique({
        where: { id: capilarSaidaId },
      }) : null,
      capilarEntradaId ? prisma.capilar.findUnique({
        where: { id: capilarEntradaId },
      }) : null,
    ]);

    if (!capilarSaida) {
      return NextResponse.json(
        { erro: "Capilar de saída não encontrado" },
        { status: 404 }
      );
    }

    if (!capilarEntrada) {
      return NextResponse.json(
        { erro: "Capilar de entrada não encontrado" },
        { status: 404 }
      );
    }

    // Cria o spliter no banco de dados
    const novoSpliter = await prisma.spliter.create({
      data: {
        nome,
        atendimento,
        tipo,
        caixaId,
        capilarSaidaId,
        capilarEntradaId,
      },
    });

    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Criação",
        entidade: "Spliter",
        entidadeId: novoSpliter.id,
        detalhes: { nome, tipo, caixaId, capilarSaidaId, capilarEntradaId },
      });
    }

    // Retorna os dados do spliter criado
    return NextResponse.json(
      { mensagem: "Spliter criado com sucesso", spliter: novoSpliter },
      { status: 201 }
    );
  } catch (error) {
    return tratarErro(error);
  }
}