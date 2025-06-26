// src/app/api/rotas/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../../utils";
import { atualizarRotaSchema } from "../schema";

/**
 * Verifica se o usuário tem acesso à rota
 */
async function verificarAcessoRota(rotaId: string, userId: string, cargo: string) {
  // Gerentes têm acesso a todas as rotas
  if (cargo === "Gerente") {
    return true;
  }

  // Verifica se o usuário tem acesso à cidade da rota
  const rota = await prisma.rota.findUnique({
    where: { id: rotaId },
    select: {
      cidadeId: true,
      cidade: {
        select: {
          usuarios: {
            where: {
              id: userId,
            },
          },
        },
      },
    },
  });

  if (!rota) {
    return false;
  }

  return rota.cidade.usuarios.length > 0;
}

/**
 * GET - Obtém uma rota específica pelo ID
 */
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    
    // Verifica se o usuário está autenticado
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json(
        { erro: "Não autorizado" },
        { status: 401 }
      );
    }

    // Busca a rota no banco de dados
    const rota = await prisma.rota.findUnique({
      where: { id },
      include: {
        cidade: {
          select: {
            id: true,
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
    });

    if (!rota) {
      return NextResponse.json(
        { erro: "Rota não encontrada" },
        { status: 404 }
      );
    }

    // Verifica se o usuário tem acesso a esta rota
    const temAcesso = await verificarAcessoRota(id, token.id as string, token.cargo as string);
    if (!temAcesso) {
      return NextResponse.json(
        { erro: "Acesso negado a esta rota" },
        { status: 403 }
      );
    }

    return NextResponse.json(rota);
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PATCH - Atualiza uma rota específica pelo ID
 */
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem atualizar rotas)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    // Busca a rota no banco de dados
    const rotaExistente = await prisma.rota.findUnique({
      where: { id },
    });

    if (!rotaExistente) {
      return NextResponse.json(
        { erro: "Rota não encontrada" },
        { status: 404 }
      );
    }

    // Verifica se o usuário tem acesso a esta rota
    const token = await verificarAutenticacao(req);
    if (token) {
      const temAcesso = await verificarAcessoRota(id, token.id as string, token.cargo as string);
      if (!temAcesso) {
        return NextResponse.json(
          { erro: "Acesso negado a esta rota" },
          { status: 403 }
        );
      }
    }

    // Extrai os dados do corpo da requisição
    const body = await req.json();
    
    // Valida os dados com o esquema Zod
    const result = atualizarRotaSchema.safeParse(body);
    
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

    // Se estiver alterando a cidade, verifica se a nova cidade existe e se o usuário tem acesso
    if (cidadeId && cidadeId !== rotaExistente.cidadeId) {
      const cidade = await prisma.cidade.findUnique({
        where: { id: cidadeId },
      });
      
      if (!cidade) {
        return NextResponse.json(
          { erro: "Cidade não encontrada" },
          { status: 404 }
        );
      }

      // Verifica se o usuário tem acesso à nova cidade
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
    }

    // Prepara os dados para atualização
    const dadosAtualizacao: any = {};
    
    if (nome !== undefined) dadosAtualizacao.nome = nome;
    if (tipoCabo !== undefined) dadosAtualizacao.tipoCabo = tipoCabo;
    if (fabricante !== undefined) dadosAtualizacao.fabricante = fabricante;
    if (distancia !== undefined) dadosAtualizacao.distancia = distancia;
    if (profundidade !== undefined) dadosAtualizacao.profundidade = profundidade;
    if (tipoPassagem !== undefined) dadosAtualizacao.tipoPassagem = tipoPassagem;
    if (coordenadas !== undefined) dadosAtualizacao.coordenadas = coordenadas;
    if (cor !== undefined) dadosAtualizacao.cor = cor;
    if (observacoes !== undefined) dadosAtualizacao.observacoes = observacoes;
    if (cidadeId !== undefined) dadosAtualizacao.cidadeId = cidadeId;

    // Atualiza a rota no banco de dados
    const rotaAtualizada = await prisma.rota.update({
      where: { id },
      data: dadosAtualizacao,
    });

    // Registra a ação no log de auditoria
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Edição",
        entidade: "Rota",
        entidadeId: id,
        detalhes: dadosAtualizacao,
      });
    }

    return NextResponse.json({
      mensagem: "Rota atualizada com sucesso",
      rota: rotaAtualizada,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * DELETE - Remove uma rota específica pelo ID
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    
    // Verifica se o usuário tem permissão (apenas Gerentes podem excluir rotas)
    const permissaoErro = await verificarPermissao(req, ["Gerente"]);
    if (permissaoErro) return permissaoErro;

    // Busca a rota no banco de dados
    const rota = await prisma.rota.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            rotaCaixas: true,
            fusoes: true,
          },
        },
      },
    });



    if (!rota) {
      return NextResponse.json(
        { erro: "Rota não encontrada" },
        { status: 404 }
      );
    }
//deleta todas as caixas dessa rota 
await prisma.caixa.deleteMany({
  where:{
    rotaCaixas:{
      some:{
        rotaId:id
      }
    }
  }
})
 

    // Verifica se a rota possui caixas ou fusões associadas
    if (rota._count.rotaCaixas > 0 || rota._count.fusoes > 0) {
      return NextResponse.json(
        { 
          erro: "Não é possível excluir a rota pois ela possui registros associados",
          detalhes: {
            caixas: rota._count.rotaCaixas,
            fusoes: rota._count.fusoes,
          }
        },
        { status: 400 }
      );
    }

    // Remove a rota do banco de dados
    await prisma.rota.delete({
      where: { id },
    });

    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Exclusão",
        entidade: "Rota",
        entidadeId: id,
        detalhes: { nome: rota.nome },
      });
    }

    return NextResponse.json({
      mensagem: "Rota removida com sucesso",
    });
  } catch (error) {
    return tratarErro(error);
  }
}