// src/app/api/neutras/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../utils";
import { neutraSchema } from "./schema";

/**
 * GET - Lista todas as neutras com paginação e filtros
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
    const vlan = searchParams.get("vlan") ? parseInt(searchParams.get("vlan") || "0") : undefined;

    // Calcula o offset para paginação
    const skip = (pagina - 1) * limite;

    // Constrói o filtro
    const where: any = {};

    // Adiciona filtro de busca por nome
    if (busca) {
      where.nome = {
        contains: busca,
        mode: "insensitive"
      };
    }

    // Adiciona filtro por vlan
    if (vlan) {
      where.vlan = vlan;
    }

    // Consulta as neutras com paginação e filtros
    const [neutras, total] = await Promise.all([
      prisma.neutra.findMany({
        where,
        select: {
          id: true,
          nome: true,
          vlan: true,
          _count: {
            select: {
              Cliente: true,
            },
          },
        },
        skip,
        take: limite,
        orderBy: { nome: "asc" },
      }),
      prisma.neutra.count({ where }),
    ]);

    // Calcula metadados de paginação
    const totalPaginas = Math.ceil(total / limite);

    return NextResponse.json({
      neutras,
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
 * POST - Cria uma nova neutra
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem criar neutras)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = neutraSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const { nome, vlan } = result.data;

    // Verifica se já existe uma neutra com a mesma VLAN
    const neutraExistente = await prisma.neutra.findFirst({
      where: { vlan },
    });

    if (neutraExistente) {
      return NextResponse.json(
        { erro: `Já existe uma neutra com a VLAN ${vlan}` },
        { status: 400 }
      );
    }

    // Cria a neutra no banco de dados
    const novaNeutra = await prisma.neutra.create({
      data: {
        nome,
        vlan,
      },
    });

    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Criação",
        entidade: "Neutra",
        entidadeId: novaNeutra.id,
        detalhes: { nome, vlan },
      });
    }

    // Retorna os dados da neutra criada
    return NextResponse.json(
      { mensagem: "Neutra criada com sucesso", neutra: novaNeutra },
      { status: 201 }
    );
  } catch (error) {
    return tratarErro(error);
  }
}