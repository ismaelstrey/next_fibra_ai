// src/app/api/bandejas/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../utils";
import { bandejaSchema } from "./schema";

/**
 * GET - Lista todas as bandejas com paginação e filtros
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

    // Consulta as bandejas com paginação e filtros
    const [bandejas, total] = await Promise.all([
      prisma.bandeja.findMany({
        where,
        select: {
          id: true,
          numero: true,
          status: true,
          caixaId: true,
          caixa: {
            select: {
              id: true,
              nome: true,
              tipo: true,
            },
          },
          fusoes: {
            select: {
              id: true,
              cor: true,
            },
          },
        },
        skip,
        take: limite,
        orderBy: { numero: "asc" },
      }),
      prisma.bandeja.count({ where }),
    ]);

    // Calcula metadados de paginação
    const totalPaginas = Math.ceil(total / limite);

    return NextResponse.json({
      bandejas,
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
 * POST - Cria uma nova bandeja
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem criar bandejas)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = bandejaSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const { numero, status, caixaId } = result.data;

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

    // Verifica se o tipo da caixa é CEO (apenas CEOs têm bandejas)
    if (caixa.tipo !== "CEO") {
      return NextResponse.json(
        { erro: "Apenas caixas do tipo CEO podem ter bandejas" },
        { status: 400 }
      );
    }

    // Verifica se já existe uma bandeja com o mesmo número na mesma caixa
    const bandejaExistente = await prisma.bandeja.findFirst({
      where: {
        numero,
        caixaId,
      },
    });

    if (bandejaExistente) {
      return NextResponse.json(
        { erro: `Já existe uma bandeja com o número ${numero} nesta caixa` },
        { status: 400 }
      );
    }

    // Cria a bandeja no banco de dados
    const novaBandeja = await prisma.bandeja.create({
      data: {
        numero,
        status,
        caixaId,
        capacidade: 48,
      },
    });

    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Criação",
        entidade: "Bandeja",
        entidadeId: novaBandeja.id,
        detalhes: { numero, status, caixaId },
      });
    }

    // Retorna os dados da bandeja criada
    return NextResponse.json(
      { mensagem: "Bandeja criada com sucesso", bandeja: novaBandeja },
      { status: 201 }
    );
  } catch (error) {
    return tratarErro(error);
  }
}