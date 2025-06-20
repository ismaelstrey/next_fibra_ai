// src/app/api/emendas/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../utils";
import { emendaSchema } from "./schema";

/**
 * GET - Lista todas as emendas com paginação e filtros
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
    const capilarSaidaId = searchParams.get("capilarSaidaId");
    const capilarEntradaId = searchParams.get("capilarEntradaId");

    // Calcula o offset para paginação
    const skip = (pagina - 1) * limite;

    // Constrói o filtro
    const where: any = {};

    // Adiciona filtro de busca por localização
    if (busca) {
      where.localizacao = {
        contains: busca,
        mode: "insensitive"
      };
    }

    // Adiciona filtro por capilar de saída
    if (capilarSaidaId) {
      where.capilarSaidaId = capilarSaidaId;
    }

    // Adiciona filtro por capilar de entrada
    if (capilarEntradaId) {
      where.capilarEntradaId = capilarEntradaId;
    }

    // Consulta as emendas com paginação e filtros
    const [emendas, total] = await Promise.all([
      prisma.emenda.findMany({
        where,
        select: {
          id: true,
          localizacao: true,
          capilarSaidaId: true,
          capilarEntradaId: true,
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
        orderBy: { localizacao: "asc" },
      }),
      prisma.emenda.count({ where }),
    ]);

    // Calcula metadados de paginação
    const totalPaginas = Math.ceil(total / limite);

    return NextResponse.json({
      emendas,
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
 * POST - Cria uma nova emenda
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem criar emendas)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = emendaSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const {
      localizacao,
      capilarSaidaId,
      capilarEntradaId
    } = result.data;

    // Verifica se os capilares existem
    const [capilarSaida, capilarEntrada] = await Promise.all([
      prisma.capilar.findUnique({
        where: { id: capilarSaidaId },
      }),
      prisma.capilar.findUnique({
        where: { id: capilarEntradaId },
      }),
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

    // Verifica se já existe uma emenda entre esses capilares
    const emendaExistente = await prisma.emenda.findFirst({
      where: {
        capilarSaidaId,
        capilarEntradaId,
      },
    });

    if (emendaExistente) {
      return NextResponse.json(
        { erro: "Já existe uma emenda entre esses capilares" },
        { status: 400 }
      );
    }

    // Cria a emenda no banco de dados
    const novaEmenda = await prisma.emenda.create({
      data: {
        localizacao,
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
        entidade: "Emenda",
        entidadeId: novaEmenda.id,
        detalhes: { localizacao, capilarSaidaId, capilarEntradaId },
      });
    }

    // Retorna os dados da emenda criada
    return NextResponse.json(
      { mensagem: "Emenda criada com sucesso", emenda: novaEmenda },
      { status: 201 }
    );
  } catch (error) {
    return tratarErro(error);
  }
}