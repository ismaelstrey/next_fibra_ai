// src/app/api/cidades/[id]/usuarios/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../../../utils";
import { usuariosCidadeSchema } from "../../schema";

/**
 * GET - Lista todos os usuários associados a uma cidade
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // Verifica se o usuário tem permissão (apenas Gerentes podem ver todos os usuários)
    const permissaoErro = await verificarPermissao(req, ["Gerente"]);
    if (permissaoErro) return permissaoErro;

    // Busca a cidade no banco de dados
    const cidade = await prisma.cidade.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        estado: true,
        usuarios: {
          select: {
            id: true,
            nome: true,
            email: true,
            cargo: true,
            imagem: true,
          },
          orderBy: { nome: "asc" },
        },
      },
    });

    if (!cidade) {
      return NextResponse.json(
        { erro: "Cidade não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      cidade: {
        id: cidade.id,
        nome: cidade.nome,
        estado: cidade.estado,
      },
      usuarios: cidade.usuarios,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PUT - Atualiza os usuários associados a uma cidade
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // Verifica se o usuário tem permissão (apenas Gerentes podem atualizar associações)
    const permissaoErro = await verificarPermissao(req, ["Gerente"]);
    if (permissaoErro) return permissaoErro;

    // Busca a cidade no banco de dados
    const cidade = await prisma.cidade.findUnique({
      where: { id },
    });

    if (!cidade) {
      return NextResponse.json(
        { erro: "Cidade não encontrada" },
        { status: 404 }
      );
    }

    // Extrai os dados do corpo da requisição
    const body = await req.json();
    
    // Valida os dados com o esquema Zod
    const result = usuariosCidadeSchema.safeParse(body);
    
    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }
    
    const { usuarioIds } = result.data;

    // Verifica se todos os usuários existem
    const usuarios = await prisma.usuario.findMany({
      where: {
        id: { in: usuarioIds },
      },
      select: { id: true },
    });

    const usuariosEncontrados = usuarios.map(usuario => usuario.id);
    const usuariosInvalidos = usuarioIds.filter(id => !usuariosEncontrados.includes(id));

    if (usuariosInvalidos.length > 0) {
      return NextResponse.json(
        { erro: "Alguns usuários não foram encontrados", usuariosInvalidos },
        { status: 400 }
      );
    }

    // Atualiza as associações de usuários da cidade
    await prisma.cidade.update({
      where: { id },
      data: {
        usuarios: {
          set: usuarioIds.map(usuarioId => ({ id: usuarioId })),
        },
      },
    });

    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Edição",
        entidade: "Cidade",
        entidadeId: id,
        detalhes: { usuariosAtualizados: usuarioIds },
      });
    }

    return NextResponse.json({
      mensagem: "Usuários da cidade atualizados com sucesso",
      usuariosAssociados: usuarioIds,
    });
  } catch (error) {
    return tratarErro(error);
  }
}