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
    const tuboId = searchParams.get("tuboId");
    const caixaId = searchParams.get("caixaId");

    console.log(rotaId, caixaId)

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
      where.rota = {
        some: {
          id: rotaId
        }
      };
    }
    // Remove filtro por rotaId (obsoleto)
    // Adiciona filtro por tuboId
    if (tuboId) {
      where.tuboId = tuboId;
    }

    // Adiciona filtro por caixa (através de spliters)
    if (caixaId) {
      where.OR = [
        // Capilares conectados como entrada de spliter na caixa
        {
          spliter_entrada: {
            some: {
              caixaId: caixaId
            }
          }
        }
      ];
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
          tubo: {
            select: {
              id: true,
              tipo: true,
              rota: {
                select: {
                  id: true,
                  nome: true,
                  tipoCabo: true
                }
              }
            }
          },
          _count: {
            select: {
              saidas: true,
              entradas: true,
              spliter_entrada: true
            }
          }
        },
        skip,
        take: limite,
        orderBy: { numero: "asc" }
      }),
      prisma.capilar.count({ where })
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

    // Extrai os campos validados
    const { numero, tipo, comprimento, status, potencia, tuboId } = result.data;

    // Validação obrigatória do tuboId
    if (!tuboId) {
      return NextResponse.json(
        { erro: "O campo tuboId é obrigatório para criar um capilar." },
        { status: 400 }
      );
    }
    const tubo = await prisma.tubo.findUnique({ where: { id: tuboId } });
    if (!tubo) {
      return NextResponse.json(
        { erro: "Tubo não encontrado" },
        { status: 404 }
      );
    }
    const novoCapilar = await prisma.capilar.create({
      data: {
        numero,
        tipo,
        comprimento,
        status,
        potencia,
        tubo: { connect: { id: tuboId } }
      }
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
        detalhes: { numero, tipo, comprimento, status, potencia, tuboId },
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