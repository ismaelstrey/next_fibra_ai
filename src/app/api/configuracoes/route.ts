// src/app/api/configuracoes/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarAutenticacao, verificarPermissao, tratarErro, registrarLog } from "../utils";
import { configuracaoGlobalSchema, atualizarConfiguracaoGlobalSchema } from "./schema";

/**
 * GET - Lista configurações globais do sistema com filtros
 */
export async function GET(req: NextRequest) {
  try {
    // Verifica autenticação
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    // Extrai parâmetros de consulta
    const url = new URL(req.url);
    const categoria = url.searchParams.get("categoria") || undefined;
    const chave = url.searchParams.get("chave") || undefined;
    const busca = url.searchParams.get("busca") || undefined;

    // Constrói o filtro para a consulta
    const filtro: any = {};

    // Filtro por categoria
    if (categoria) {
      filtro.categoria = categoria;
    }

    // Filtro por chave específica
    if (chave) {
      filtro.chave = chave;
    }

    // Filtro por termo de busca
    if (busca) {
      filtro.OR = [
        { chave: { contains: busca, mode: "insensitive" } },
        { descricao: { contains: busca, mode: "insensitive" } },
        { categoria: { contains: busca, mode: "insensitive" } },
      ];
    }

    // Busca as configurações
    const configuracoes = await prisma.configuracaoGlobal.findMany({
      where: filtro,
      orderBy: [
        { categoria: "asc" },
        { chave: "asc" },
      ],
    });

    // Retorna as configurações
    return NextResponse.json(configuracoes);
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * POST - Cria uma nova configuração global
 * Apenas usuários com cargo de Gerente podem criar configurações
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica autenticação
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    // Verifica se o usuário tem permissão de Gerente
    if (token.cargo !== "Gerente") {
      return NextResponse.json(
        { erro: "Você não tem permissão para criar configurações globais" },
        { status: 403 }
      );
    }

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = configuracaoGlobalSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const { chave, valor, descricao, categoria, editavel } = result.data;

    // Verifica se já existe uma configuração com a mesma chave
    const configuracaoExistente = await prisma.configuracaoGlobal.findUnique({
      where: { chave },
    });

    if (configuracaoExistente) {
      return NextResponse.json(
        { erro: `Já existe uma configuração com a chave '${chave}'` },
        { status: 409 }
      );
    }

    // Cria a configuração no banco de dados
    const configuracao = await prisma.configuracaoGlobal.create({
      data: {
        chave,
        valor,
        descricao,
        categoria,
        editavel,
      },
    });

    // Registra a ação no log de auditoria
    await registrarLog({
      prisma,
      usuarioId: token.sub as string,
      acao: "Criação",
      entidade: "ConfiguracaoGlobal",
      entidadeId: configuracao.id,
      detalhes: { chave, categoria },
    });

    // Retorna a configuração criada
    return NextResponse.json({
      mensagem: "Configuração criada com sucesso",
      configuracao,
    });
  } catch (error) {
    return tratarErro(error);
  }
}