// src/app/api/cidades/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../../utils";
import { atualizarCidadeSchema } from "../schema";

/**
 * GET - Obtém uma cidade específica pelo ID
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Verifica se o usuário está autenticado
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json(
        { erro: "Não autorizado" },
        { status: 401 }
      );
    }

    // Busca a cidade no banco de dados
    const cidade = await prisma.cidade.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            usuarios: true,
            rotas: true,
            caixas: true,
          },
        },
      },
    });

    if (!cidade) {
      return NextResponse.json(
        { erro: "Cidade não encontrada" },
        { status: 404 }
      );
    }

    // Verifica se o usuário tem acesso a esta cidade
    const ehGerente = token.cargo === "Gerente";
    
    if (!ehGerente) {
      // Se não for gerente, verifica se o usuário está associado à cidade
      const temAcesso = await prisma.cidade.findFirst({
        where: {
          id,
          usuarios: {
            some: {
              id: token.id as string,
            },
          },
        },
      });

      if (!temAcesso) {
        return NextResponse.json(
          { erro: "Acesso negado a esta cidade" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(cidade);
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PATCH - Atualiza uma cidade específica pelo ID
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Verifica se o usuário tem permissão (apenas Gerentes podem atualizar cidades)
    const permissaoErro = await verificarPermissao(req, ["Gerente"]);
    if (permissaoErro) return permissaoErro;

    // Busca a cidade no banco de dados
    const cidadeExistente = await prisma.cidade.findUnique({
      where: { id },
    });

    if (!cidadeExistente) {
      return NextResponse.json(
        { erro: "Cidade não encontrada" },
        { status: 404 }
      );
    }

    // Extrai os dados do corpo da requisição
    const body = await req.json();
    
    // Valida os dados com o esquema Zod
    const result = atualizarCidadeSchema.safeParse(body);
    
    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }
    
    const { nome, estado, coordenadas } = result.data;

    // Verifica se já existe outra cidade com o mesmo nome e estado
    if (nome && estado && (nome !== cidadeExistente.nome || estado !== cidadeExistente.estado)) {
      const cidadeComMesmoNome = await prisma.cidade.findFirst({
        where: {
          nome,
          estado,
          id: { not: id },
        },
      });
      
      if (cidadeComMesmoNome) {
        return NextResponse.json(
          { erro: "Já existe uma cidade com este nome neste estado" },
          { status: 409 }
        );
      }
    }

    // Prepara os dados para atualização
    const dadosAtualizacao: any = {};
    
    if (nome) dadosAtualizacao.nome = nome;
    if (estado) dadosAtualizacao.estado = estado;
    if (coordenadas !== undefined) dadosAtualizacao.coordenadas = coordenadas;

    // Atualiza a cidade no banco de dados
    const cidadeAtualizada = await prisma.cidade.update({
      where: { id },
      data: dadosAtualizacao,
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
        detalhes: dadosAtualizacao,
      });
    }

    return NextResponse.json({
      mensagem: "Cidade atualizada com sucesso",
      cidade: cidadeAtualizada,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * DELETE - Remove uma cidade específica pelo ID
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Verifica se o usuário tem permissão (apenas Gerentes podem excluir cidades)
    const permissaoErro = await verificarPermissao(req, ["Gerente"]);
    if (permissaoErro) return permissaoErro;

    // Busca a cidade no banco de dados
    const cidade = await prisma.cidade.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            rotas: true,
            caixas: true,
          },
        },
      },
    });

    if (!cidade) {
      return NextResponse.json(
        { erro: "Cidade não encontrada" },
        { status: 404 }
      );
    }

    // Verifica se a cidade possui rotas ou caixas associadas
    if (cidade._count.rotas > 0 || cidade._count.caixas > 0) {
      return NextResponse.json(
        { 
          erro: "Não é possível excluir a cidade pois ela possui registros associados",
          detalhes: {
            rotas: cidade._count.rotas,
            caixas: cidade._count.caixas,
          }
        },
        { status: 400 }
      );
    }

    // Remove a cidade do banco de dados
    await prisma.cidade.delete({
      where: { id },
    });

    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Exclusão",
        entidade: "Cidade",
        entidadeId: id,
        detalhes: { nome: cidade.nome, estado: cidade.estado },
      });
    }

    return NextResponse.json({
      mensagem: "Cidade removida com sucesso",
    });
  } catch (error) {
    return tratarErro(error);
  }
}