// src/app/api/arquivos/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../../utils";
import { atualizarArquivoSchema } from "../schema";

/**
 * GET - Obtém um arquivo específico por ID
 */
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário está autenticado
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json(
        { erro: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Busca o arquivo com todas as informações relacionadas
    const arquivo = await prisma.arquivo.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        caixa: {
          select: {
            id: true,
            nome: true,
            tipo: true,
          },
        },
        capilar: {
          select: {
            id: true,
            numero: true,
            tipo: true,
          },
        },
        emenda: {
          select: {
            id: true,
            localizacao: true,
          },
        },
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    if (!arquivo) {
      return NextResponse.json(
        { erro: "Arquivo não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(arquivo);
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PATCH - Atualiza um arquivo específico por ID
 */
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem atualizar arquivos)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se o arquivo existe
    const arquivoExistente = await prisma.arquivo.findUnique({
      where: { id },
      select: {
        id: true,
        usuarioId: true,
      },
    });

    if (!arquivoExistente) {
      return NextResponse.json(
        { erro: "Arquivo não encontrado" },
        { status: 404 }
      );
    }

    // Obtém o token do usuário autenticado
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json(
        { erro: "Não autorizado" },
        { status: 401 }
      );
    }

    // Verifica se o usuário é o proprietário do arquivo ou é um gerente
    if (arquivoExistente.usuarioId !== token.id && token.cargo !== "Gerente") {
      return NextResponse.json(
        { erro: "Você não tem permissão para atualizar este arquivo" },
        { status: 403 }
      );
    }

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = atualizarArquivoSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    // Atualiza o arquivo no banco de dados
    const arquivoAtualizado = await prisma.arquivo.update({
      where: { id },
      data: result.data,
    });

    // Registra a ação no log de auditoria
    await registrarLog({
      prisma,
      usuarioId: token.id as string,
      acao: "Atualização",
      entidade: "Arquivo",
      entidadeId: id,
      detalhes: result.data,
    });

    return NextResponse.json({
      mensagem: "Arquivo atualizado com sucesso",
      arquivo: arquivoAtualizado,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * DELETE - Remove um arquivo específico por ID
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem excluir arquivos)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se o arquivo existe
    const arquivo = await prisma.arquivo.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        usuarioId: true,
      },
    });

    if (!arquivo) {
      return NextResponse.json(
        { erro: "Arquivo não encontrado" },
        { status: 404 }
      );
    }

    // Obtém o token do usuário autenticado
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json(
        { erro: "Não autorizado" },
        { status: 401 }
      );
    }

    // Verifica se o usuário é o proprietário do arquivo ou é um gerente
    if (arquivo.usuarioId !== token.id && token.cargo !== "Gerente") {
      return NextResponse.json(
        { erro: "Você não tem permissão para excluir este arquivo" },
        { status: 403 }
      );
    }

    // Exclui o arquivo
    await prisma.arquivo.delete({
      where: { id },
    });

    // Registra a ação no log de auditoria
    await registrarLog({
      prisma,
      usuarioId: token.id as string,
      acao: "Exclusão",
      entidade: "Arquivo",
      entidadeId: id,
      detalhes: { nome: arquivo.nome },
    });

    return NextResponse.json({
      mensagem: "Arquivo excluído com sucesso",
    });
  } catch (error) {
    return tratarErro(error);
  }
}