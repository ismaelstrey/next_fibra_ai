// src/app/api/configuracoes/usuario/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarAutenticacao, tratarErro, registrarLog } from "../../utils";
import { configuracaoUsuarioSchema} from "../schema";

/**
 * GET - Lista configurações do usuário autenticado
 */
export async function GET(req: NextRequest) {
  try {
    // Verifica autenticação
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const usuarioId = token.sub as string;

    // Extrai parâmetros de consulta
    const url = new URL(req.url);
    const chave = url.searchParams.get("chave") || undefined;

    // Constrói o filtro para a consulta
    const filtro: any = {
      usuarioId,
    };

    // Filtro por chave específica
    if (chave) {
      filtro.chave = chave;
    }

    // Busca as configurações do usuário
    const configuracoes = await prisma.configuracaoUsuario.findMany({
      where: filtro,
      orderBy: {
        chave: "asc",
      },
    });

    // Retorna as configurações
    return NextResponse.json(configuracoes);
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * POST - Cria ou atualiza uma configuração do usuário
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica autenticação
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const usuarioId = token.sub as string;

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = configuracaoUsuarioSchema.safeParse({
      ...body,
      usuarioId, // Garante que o usuário só pode criar configurações para si mesmo
    });

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const { chave, valor } = result.data;

    // Verifica se já existe uma configuração com a mesma chave para este usuário
    const configuracaoExistente = await prisma.configuracaoUsuario.findUnique({
      where: {
        usuarioId_chave: {
          usuarioId,
          chave,
        },
      },
    });

    let configuracao;
    let acao;

    if (configuracaoExistente) {
      // Atualiza a configuração existente
      configuracao = await prisma.configuracaoUsuario.update({
        where: {
          usuarioId_chave: {
            usuarioId,
            chave,
          },
        },
        data: {
          valor,
        },
      });
      acao = "Atualização";
    } else {
      // Cria uma nova configuração
      configuracao = await prisma.configuracaoUsuario.create({
        data: {
          usuarioId,
          chave,
          valor,
        },
      });
      acao = "Criação";
    }

    // Registra a ação no log de auditoria
    await registrarLog({
      prisma,
      usuarioId,
      acao,
      entidade: "ConfiguracaoUsuario",
      entidadeId: configuracao.id,
      detalhes: { chave, valor },
    });

    // Retorna a configuração criada/atualizada
    return NextResponse.json({
      mensagem: `Configuração ${acao === "Criação" ? "criada" : "atualizada"} com sucesso`,
      configuracao,
    });
  } catch (error) {
    return tratarErro(error);
  }
}