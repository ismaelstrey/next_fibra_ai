// src/app/api/portas/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../utils";
import { portaSchema } from "./schema";

/**
 * GET - Lista todas as portas com paginação e filtros
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
    const numero = searchParams.get("numero") ? parseInt(searchParams.get("numero") || "0") : undefined;
    const status = searchParams.get("status");
    const caixaId = searchParams.get("caixaId");
    const splitterId = searchParams.get("splitterId");

    // Calcula o offset para paginação
    const skip = (pagina - 1) * limite;

    // Constrói o filtro
    const where: any = {};

    // Adiciona filtro por número
    if (numero !== undefined) {
      where.numero = numero;
    }

    // Adiciona filtro por status
    if (status) {
      where.status = status;
    }

    // Adiciona filtro por caixa
    if (caixaId) {
      where.caixaId = caixaId;
    }

    // Adiciona filtro por splitter
    if (splitterId) {
      where.splitterId = splitterId;
    }

    // Consulta as portas com paginação e filtros
    const [portas, total] = await Promise.all([
      prisma.porta.findMany({
        where,
        select: {
          id: true,
          numero: true,
          status: true,
          caixaId: true,
          splitterId: true,
          caixa: {
            select: {
              id: true,
              nome: true,
              tipo: true,
            },
          },
          splitter: {
            select: {
              id: true,
              nome: true,
              tipo: true,
            },
          },
          Cliente: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
        },
        skip,
        take: limite,
        orderBy: { numero: "asc" },
      }),
      prisma.porta.count({ where }),
    ]);

    // Calcula metadados de paginação
    const totalPaginas = Math.ceil(total / limite);

    return NextResponse.json({
      portas,
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
 * POST - Cria uma nova porta
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem criar portas)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = portaSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const { numero, status, caixaId, splitterId } = result.data;

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

    // Verifica se o tipo da caixa é CTO (apenas CTOs têm portas)
    if (caixa.tipo !== "CTO") {
      return NextResponse.json(
        { erro: "Apenas caixas do tipo CTO podem ter portas" },
        { status: 400 }
      );
    }

    // Verifica se já existe uma porta com o mesmo número na mesma caixa
    const portaExistente = await prisma.porta.findFirst({
      where: {
        numero,
        caixaId,
      },
    });

    if (portaExistente) {
      return NextResponse.json(
        { erro: `Já existe uma porta com o número ${numero} nesta caixa` },
        { status: 400 }
      );
    }

    // Verifica se o splitter existe, caso tenha sido informado
    if (splitterId) {
      const splitter = await prisma.spliter.findUnique({
        where: { id: splitterId },
      });

      if (!splitter) {
        return NextResponse.json(
          { erro: "Splitter não encontrado" },
          { status: 404 }
        );
      }
    }

    // Cria a porta no banco de dados
    const novaPorta = await prisma.porta.create({
      data: {
        numero,
        status,
        caixaId,
        splitterId,
      },
    });

    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Criação",
        entidade: "Porta",
        entidadeId: novaPorta.id,
        detalhes: { numero, status, caixaId, splitterId },
      });
    }

    // Retorna os dados da porta criada
    return NextResponse.json(
      { mensagem: "Porta criada com sucesso", porta: novaPorta },
      { status: 201 }
    );
  } catch (error) {
    return tratarErro(error);
  }
}