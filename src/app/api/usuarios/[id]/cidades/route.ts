// src/app/api/usuarios/[id]/cidades/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao } from "../../../utils";
import { z } from "zod";

// Esquema para validação de associação de cidades
const cidadesSchema = z.object({
  cidadeIds: z.array(z.string()),
});

/**
 * GET - Lista todas as cidades associadas a um usuário
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const token = await verificarAutenticacao(req);

    // Verifica se o usuário está autenticado
    if (!token) {
      return NextResponse.json(
        { erro: "Não autorizado" },
        { status: 401 }
      );
    }

    // Verifica se o usuário tem permissão para ver estas cidades
    // (apenas o próprio usuário ou um Gerente pode ver)
    const ehProprioUsuario = token.id === id;
    const ehGerente = token.cargo === "Gerente";

    if (!ehProprioUsuario && !ehGerente) {
      return NextResponse.json(
        { erro: "Acesso negado" },
        { status: 403 }
      );
    }

    // Busca o usuário com suas cidades
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        cidades: {
          select: {
            id: true,
            nome: true,
            estado: true,
            coordenadas: true,
            _count: {
              select: {
                rotas: true,
                caixas: true,
              },
            },
          },
        },
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { erro: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
      },
      cidades: usuario.cidades,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PUT - Atualiza as cidades associadas a um usuário
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // Verifica se o usuário tem permissão (apenas Gerentes podem atualizar associações)
    const permissaoErro = await verificarPermissao(req, ["Gerente"]);
    if (permissaoErro) return permissaoErro;

    // Busca o usuário no banco de dados
    const usuario = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      return NextResponse.json(
        { erro: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Extrai os dados do corpo da requisição
    const body = await req.json();
    
    // Valida os dados com o esquema Zod
    const result = cidadesSchema.safeParse(body);
    
    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }
    
    const { cidadeIds } = result.data;

    // Verifica se todas as cidades existem
    const cidades = await prisma.cidade.findMany({
      where: {
        id: { in: cidadeIds },
      },
      select: { id: true },
    });

    const cidadesEncontradas = cidades.map(cidade => cidade.id);
    const cidadesInvalidas = cidadeIds.filter(id => !cidadesEncontradas.includes(id));

    if (cidadesInvalidas.length > 0) {
      return NextResponse.json(
        { erro: "Algumas cidades não foram encontradas", cidadesInvalidas },
        { status: 400 }
      );
    }

    // Atualiza as associações de cidades do usuário
    await prisma.usuario.update({
      where: { id },
      data: {
        cidades: {
          set: cidadeIds.map(cidadeId => ({ id: cidadeId })),
        },
      },
    });

    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);
    if (token) {
      await prisma.log.create({
        data: {
          usuarioId: token.id as string,
          acao: "Edição",
          entidade: "Usuario",
          entidadeId: id,
          detalhes: { cidadesAtualizadas: cidadeIds },
        },
      });
    }

    return NextResponse.json({
      mensagem: "Cidades do usuário atualizadas com sucesso",
      cidadesAssociadas: cidadeIds,
    });
  } catch (error) {
    return tratarErro(error);
  }
}