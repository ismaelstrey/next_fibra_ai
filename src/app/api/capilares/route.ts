// src/app/api/capilares/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../utils";
import { capilarSchema } from "./schema";

/**
 * GET - Lista todos os capilares com paginação e filtros
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
    const status = searchParams.get("status");
    const rotaId = searchParams.get("rotaId");

    // Calcula o offset para paginação
    const skip = (pagina - 1) * limite;

    // Constrói o filtro
    const where: any = {};

    // Adiciona filtro de busca por número
    if (busca) {
      where.OR = [
        { numero: parseInt(busca) || undefined },
        { tipo: { contains: busca, mode: "insensitive" } }
      ];
    }

    // Adiciona filtro por tipo
    if (tipo) {
      where.tipo = tipo;
    }

    // Adiciona filtro por status
    if (status) {
      where.status = status;
    }

    // Adiciona filtro por rota
    if (rotaId) {
      where.Rota = {
        some: {
          id: rotaId
        }
      };
    }

    // Consulta os capilares com paginação e filtros
    const [capilares, total] = await Promise.all([
      prisma.capilar.findMany({
        where,
        select: {
          id: true,
          numero: true,
          tipo: true,
          comprimento: true,
          status: true,
          potencia: true,
          rota: {
            select: {
              id: true,
              nome: true,
              tipoCabo: true,
            },
          },
          _count: {
            select: {
              saidas: true,
              entradas: true,
              spliter_saida: true,
              spliter_entrada: true,
            },
          }
        },
        skip,
        take: limite,
        orderBy: { numero: "asc" },
      }),
      prisma.capilar.count({ where }),
    ]);

    // Calcula metadados de paginação
    const totalPaginas = Math.ceil(total / limite);

    return NextResponse.json({
      capilares,
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
 * POST - Cria um novo capilar
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem criar capilares)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = capilarSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const {
      numero,
      tipo,
      comprimento,
      status,
      potencia,
      rotaId
    } = result.data;

    // Verifica se a rota existe, se fornecida
    if (rotaId) {
      const rota = await prisma.rota.findUnique({
        where: { id: rotaId },
      });

      if (!rota) {
        return NextResponse.json(
          { erro: "Rota não encontrada" },
          { status: 404 }
        );
      }
    }

    // Cria o capilar no banco de dados
    const novoCapilar = await prisma.capilar.create({
      data: {
        numero,
        tipo,
        comprimento,
        status,
        potencia,
        ...(rotaId && {
          Rota: {
            connect: { id: rotaId }
          }
        })
      },
    });

    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Criação",
        entidade: "Capilar",
        entidadeId: novoCapilar.id,
        detalhes: { numero, tipo, comprimento, status, potencia, rotaId },
      });
    }

    // Retorna os dados do capilar criado
    return NextResponse.json(
      { mensagem: "Capilar criado com sucesso", capilar: novoCapilar },
      { status: 201 }
    );
  } catch (error) {
    return tratarErro(error);
  }
}