// src/app/api/rotas/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../utils";
import { rotaSchema } from "./schema";

/**
 * GET - Lista todas as rotas com paginação e filtros
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
    const cidadeId = searchParams.get("cidadeId");
    const tipoCabo = searchParams.get("tipoCabo");
    const tipoPassagem = searchParams.get("tipoPassagem");

    // Calcula o offset para paginação
    const skip = (pagina - 1) * limite;

    // Constrói o filtro
    const where: any = {};

    // Adiciona filtro de busca por nome
    if (busca) {
      where.nome = { contains: busca };
    }

    // Adiciona filtro por cidade
    if (cidadeId) {
      where.cidadeId = cidadeId;
    } else {
      // Se não for especificada uma cidade, filtra pelas cidades que o usuário tem acesso
      // Gerentes podem ver todas as cidades
      if (token.cargo !== "Gerente") {
        where.cidade = {
          usuarios: {
            some: {
              id: token.id as string,
            },
          },
        };
      }
    }

    // Adiciona filtro por tipo de cabo
    if (tipoCabo) {
      where.tipoCabo = tipoCabo;
    }

    // Adiciona filtro por tipo de passagem
    if (tipoPassagem) {
      where.tipoPassagem = tipoPassagem;
    }

    // Consulta as rotas com paginação e filtros
    const [rotas, total] = await Promise.all([
      prisma.rota.findMany({
        where,
        select: {
          id: true,
          nome: true,
          tipoCabo: true,
          fabricante: true,
          distancia: true,
          profundidade: true,
          tipoPassagem: true,
          coordenadas: true,
          cor: true,
          observacoes: true,
          criadoEm: true,
          atualizadoEm: true,
          cidadeId: true,
          cidade: {
            select: {
              nome: true,
              estado: true,
            },
          },
          _count: {
            select: {
              rotaCaixas: true,
              fusoes: true,
              comentarios: true,
              arquivos: true,
            },
          },
        },
        skip,
        take: limite,
        orderBy: { nome: "asc" },
      }),
      prisma.rota.count({ where }),
    ]);

    // Calcula metadados de paginação
    const totalPaginas = Math.ceil(total / limite);

    return NextResponse.json({
      rotas,
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
 * POST - Cria uma nova rota
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem criar rotas)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = rotaSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const {
      nome,
      tipoCabo,
      fabricante,
      distancia,
      profundidade,
      tipoPassagem,
      coordenadas,
      cor,
      observacoes,
      cidadeId
    } = result.data;

    // Verifica se a cidade existe
    const cidade = await prisma.cidade.findUnique({
      where: { id: cidadeId },
    });

    if (!cidade) {
      return NextResponse.json(
        { erro: "Cidade não encontrada" },
        { status: 404 }
      );
    }

    // Verifica se o usuário tem acesso à cidade
    const token = await verificarAutenticacao(req);
    if (token && token.cargo !== "Gerente") {
      const temAcesso = await prisma.cidade.findFirst({
        where: {
          id: cidadeId,
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

    // Cria a rota no banco de dados
    const novaRota = await prisma.rota.create({
      data: {
        nome,
        tipoCabo,
        fabricante,
        distancia,
        profundidade,
        tipoPassagem,
        coordenadas,
        cor,
        observacoes,
        cidadeId
      }
    });

    // Lógica para criar tubos e capilares conforme o tipo de cabo
    const tipoCaboNum = parseInt(tipoCabo);
    let numTubos = 1;
    if (tipoCaboNum === 24) numTubos = 2;
    else if (tipoCaboNum === 36) numTubos = 3;
    else if (tipoCaboNum === 48) numTubos = 4;
    else if (tipoCaboNum === 96) numTubos = 8;
    else if (tipoCaboNum === 144) numTubos = 12;
    for (let t = 1; t <= numTubos; t++) {
      const tubo = await prisma.tubo.create({
        data: {
          numero: t,
          tipo: '12',
          quantidadeCapilares: 12,
          rotaId: novaRota.id
        }
      });
      // Cria 12 capilares para cada tubo
      for (let c = 1; c <= 12; c++) {
        await prisma.capilar.create({
          data: {
            numero: c,
            tipo: tipoCabo,
            comprimento: distancia || 0,
            status: 'Ativo',
            potencia: 0,
            tuboId: tubo.id,
            cidadeId: cidadeId
          }
        });
      }
    }

    // Registra a ação no log de auditoria
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Criação",
        entidade: "Rota",
        entidadeId: novaRota.id,
        detalhes: { nome, cidadeId, quantidadeCapilares: tipoCaboNum },
      });
    }

    // Retorna os dados da rota criada
    return NextResponse.json(
      { mensagem: "Rota criada com sucesso", rota: novaRota },
      { status: 201 }
    );
  } catch (error) {
    return tratarErro(error);
  }
}