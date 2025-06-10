// src/app/api/configuracoes/[chave]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarAutenticacao, tratarErro, registrarLog } from "../../utils";
import { atualizarConfiguracaoGlobalSchema } from "../schema";

/**
 * GET - Obtém detalhes de uma configuração global específica
 */
export async function GET(req: NextRequest, { params }: { params: { chave: string } }) {
  try {
    const { chave } = params;

    // Verifica autenticação
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    // Busca a configuração pelo chave
    const configuracao = await prisma.configuracaoGlobal.findUnique({
      where: { chave },
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
 * PATCH - Atualiza uma configuração global específica
 */
export async function PATCH(req: NextRequest, { params }: { params: { chave: string } }) {
  try {
    const { chave } = params;

    // Verifica autenticação
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    // Busca a configuração para verificar se existe e se é editável
    const configuracaoExistente = await prisma.configuracaoGlobal.findUnique({
      where: { chave },
    });

    // Se a configuração não for encontrada, retorna erro 404
    if (!configuracaoExistente) {
      return NextResponse.json({ erro: "Configuração não encontrada" }, { status: 404 });
    }

    // Verifica se o usuário tem permissão para editar a configuração
    // Gerentes podem editar qualquer configuração
    // Outros usuários só podem editar configurações marcadas como editáveis
    if (token.cargo !== "Gerente" && !configuracaoExistente.editavel) {
      return NextResponse.json(
        { erro: "Você não tem permissão para editar esta configuração" },
        { status: 403 }
      );
    }

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = atualizarConfiguracaoGlobalSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const { valor, descricao, categoria, editavel } = result.data;

    // Prepara os dados para atualização
    const dadosAtualizacao: any = {};

    // Apenas Gerentes podem atualizar metadados da configuração
    if (token.cargo === "Gerente") {
      if (descricao !== undefined) dadosAtualizacao.descricao = descricao;
      if (categoria !== undefined) dadosAtualizacao.categoria = categoria;
      if (editavel !== undefined) dadosAtualizacao.editavel = editavel;
    }

    // Qualquer usuário autorizado pode atualizar o valor
    if (valor !== undefined) dadosAtualizacao.valor = valor;

    // Atualiza a configuração no banco de dados
    const configuracaoAtualizada = await prisma.configuracaoGlobal.update({
      where: { chave },
      data: dadosAtualizacao,
    });

    // Registra a ação no log de auditoria
    await registrarLog({
      prisma,
      usuarioId: token.sub as string,
      acao: "Atualização",
      entidade: "ConfiguracaoGlobal",
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
 * DELETE - Remove uma configuração global específica
 * Apenas usuários com cargo de Gerente podem excluir configurações
 */
export async function DELETE(req: NextRequest, { params }: { params: { chave: string } }) {
  try {
    const { chave } = params;

    // Verifica autenticação
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    // Verifica se o usuário tem permissão de Gerente
    if (token.cargo !== "Gerente") {
      return NextResponse.json(
        { erro: "Você não tem permissão para excluir configurações globais" },
        { status: 403 }
      );
    }

    // Verifica se a configuração existe
    const configuracaoExistente = await prisma.configuracaoGlobal.findUnique({
      where: { chave },
    });

    if (!configuracaoExistente) {
      return NextResponse.json({ erro: "Configuração não encontrada" }, { status: 404 });
    }

    // Remove a configuração do banco de dados
    await prisma.configuracaoGlobal.delete({
      where: { chave },
    });

    // Registra a ação no log de auditoria
    await registrarLog({
      prisma,
      usuarioId: token.sub as string,
      acao: "Exclusão",
      entidade: "ConfiguracaoGlobal",
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