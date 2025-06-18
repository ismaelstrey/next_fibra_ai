// src/app/api/configuracoes/usuario/[chave]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarAutenticacao, tratarErro, registrarLog } from "../../../utils";
import { atualizarConfiguracaoUsuarioSchema } from "../../schema";

/**
 * GET - Obtém detalhes de uma configuração específica do usuário
 */
export async function GET(req: NextRequest, props: { params: Promise<{ chave: string }> }) {
  const params = await props.params;
  try {
    const { chave } = params;

    // Verifica autenticação
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const usuarioId = token.sub as string;

    // Busca a configuração pelo chave e usuário
    const configuracao = await prisma.configuracaoUsuario.findUnique({
      where: {
        usuarioId_chave: {
          usuarioId,
          chave,
        },
      },
    });

    // Se a configuração não for encontrada, retorna erro 404
    if (!configuracao) {
      return NextResponse.json({ erro: "Configuração não encontrada" }, { status: 404 });
    }

    // Retorna os detalhes da configuração
    return NextResponse.json(configuracao);
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PATCH - Atualiza uma configuração específica do usuário
 */
export async function PATCH(req: NextRequest, props: { params: Promise<{ chave: string }> }) {
  const params = await props.params;
  try {
    const { chave } = params;

    // Verifica autenticação
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const usuarioId = token.sub as string;

    // Verifica se a configuração existe
    const configuracaoExistente = await prisma.configuracaoUsuario.findUnique({
      where: {
        usuarioId_chave: {
          usuarioId,
          chave,
        },
      },
    });

    // Se a configuração não for encontrada, retorna erro 404
    if (!configuracaoExistente) {
      return NextResponse.json({ erro: "Configuração não encontrada" }, { status: 404 });
    }

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = atualizarConfiguracaoUsuarioSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const { valor } = result.data;

    // Atualiza a configuração no banco de dados
    const configuracaoAtualizada = await prisma.configuracaoUsuario.update({
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

    // Registra a ação no log de auditoria
    await registrarLog({
      prisma,
      usuarioId,
      acao: "Atualização",
      entidade: "ConfiguracaoUsuario",
      entidadeId: configuracaoAtualizada.id,
      detalhes: { chave, valor },
    });

    // Retorna os dados da configuração atualizada
    return NextResponse.json({
      mensagem: "Configuração atualizada com sucesso",
      configuracao: configuracaoAtualizada,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * DELETE - Remove uma configuração específica do usuário
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ chave: string }> }) {
  const params = await props.params;
  try {
    const { chave } = params;

    // Verifica autenticação
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const usuarioId = token.sub as string;

    // Verifica se a configuração existe
    const configuracaoExistente = await prisma.configuracaoUsuario.findUnique({
      where: {
        usuarioId_chave: {
          usuarioId,
          chave,
        },
      },
    });

    if (!configuracaoExistente) {
      return NextResponse.json({ erro: "Configuração não encontrada" }, { status: 404 });
    }

    // Remove a configuração do banco de dados
    await prisma.configuracaoUsuario.delete({
      where: {
        usuarioId_chave: {
          usuarioId,
          chave,
        },
      },
    });

    // Registra a ação no log de auditoria
    await registrarLog({
      prisma,
      usuarioId,
      acao: "Exclusão",
      entidade: "ConfiguracaoUsuario",
      entidadeId: configuracaoExistente.id,
      detalhes: { chave },
    });

    // Retorna mensagem de sucesso
    return NextResponse.json({
      mensagem: "Configuração excluída com sucesso",
    });
  } catch (error) {
    return tratarErro(error);
  }
}