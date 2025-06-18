// src/app/api/cidades/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../utils";
import { cidadeSchema } from "./schema";
import { Busca } from "@/types/busca";

/**
 * GET - Lista todas as cidades com paginação e filtros
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
    const estado = searchParams.get("estado");
    const apenasMinhasCidades = searchParams.get("apenasMinhas") === "true";

    // Calcula o offset para paginação
    const skip = (pagina - 1) * limite;

    // Constrói o filtro
    const where: Busca = {};
    
    // Adiciona filtro de busca por nome
    if (busca) {
      where.nome =  busca ;
    }

    // Adiciona filtro por estado
    if (estado) {
      where.estado = estado;
    }

    // Filtra apenas cidades do usuário se solicitado
    if (apenasMinhasCidades) {
      where.OR = [
        { caixas: { some: { cidade: { usuarios: { some: { id: token.id as string } } } } } },
        { rotas: { some: { cidade: { usuarios: { some: { id: token.id as string } } } } } },
      ];
    }

    // Consulta as cidades com paginação e filtros
    const [cidades, total] = await Promise.all([
      prisma.cidade.findMany({
        where,
        select: {
          id: true,
          nome: true,
          estado: true,
          coordenadas: true,
          criadoEm: true,
          atualizadoEm: true,
          _count: {
            select: {
              usuarios: true,
              rotas: true,
              caixas: true,
            },
          },
        },
        skip,
        take: limite,
        orderBy: { nome: "asc" },
      }),
      prisma.cidade.count({ where }),
    ]);

    // Calcula metadados de paginação
    const totalPaginas = Math.ceil(total / limite);

    return NextResponse.json({
      cidades,
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
 * POST - Cria uma nova cidade
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica se o usuário tem permissão (apenas Gerentes podem criar cidades)
    const permissaoErro = await verificarPermissao(req, ["Gerente"]);
    if (permissaoErro) return permissaoErro;

    // Extrai os dados do corpo da requisição
    const body = await req.json();
    
    // Valida os dados com o esquema Zod
    const result = cidadeSchema.safeParse(body);
    
    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }
    
    const { nome, estado, coordenadas } = result.data;
    
    // Verifica se já existe uma cidade com o mesmo nome e estado
    const cidadeExistente = await prisma.cidade.findFirst({
      where: {
        nome,
        estado,
      },
    });
    
    if (cidadeExistente) {
      return NextResponse.json(
        { erro: "Já existe uma cidade com este nome neste estado" },
        { status: 409 }
      );
    }
    
    // Cria a cidade no banco de dados
    const novaCidade = await prisma.cidade.create({
      data: {
        nome,
        estado,
        coordenadas: coordenadas || { latitude: 0, longitude: 0},
      },
    });

    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Criação",
        entidade: "Cidade",
        entidadeId: novaCidade.id,
        detalhes: { nome, estado },
      });
    }
    
    // Retorna os dados da cidade criada
    return NextResponse.json(
      { mensagem: "Cidade criada com sucesso", cidade: novaCidade },
      { status: 201 }
    );
  } catch (error) {
    return tratarErro(error);
  }
}