// src/app/api/equipamentos/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../utils";
import { equipamentoSchema } from "./schema";

/**
 * Função auxiliar para verificar se o usuário tem acesso à entidade
 */
async function verificarAcessoEntidade(req: NextRequest, caixaId?: string, emendaId?: string, clienteId?: string) {
  const token = await verificarAutenticacao(req);
  if (!token) {
    return { erro: NextResponse.json({ erro: "Não autorizado" }, { status: 401 }) };
  }

  // Gerentes têm acesso a todas as entidades
  if (token.cargo === "Gerente") {
    return { temAcesso: true, token };
  }

  // Se foi especificada uma caixa, verifica se o usuário tem acesso
  if (caixaId) {
    const caixa = await prisma.caixa.findUnique({
      where: { id: caixaId },
      select: {
        id: true,
        cidadeId: true,
        cidade: {
          select: {
            usuarios: {
              where: {
                id: token.id as string,
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!caixa) {
      return { erro: NextResponse.json({ erro: "Caixa não encontrada" }, { status: 404 }) };
    }

    if (caixa.cidade.usuarios.length === 0) {
      return { erro: NextResponse.json({ erro: "Você não tem acesso a esta caixa" }, { status: 403 }) };
    }
  }

  // Se foi especificada uma emenda, verifica se o usuário tem acesso
  if (emendaId) {
    const emenda = await prisma.emenda.findUnique({
      where: { id: emendaId },
      select: {
        id: true,
        cidadeId: true,
        cidade: {
          select: {
            usuarios: {
              where: {
                id: token.id as string,
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!emenda) {
      return { erro: NextResponse.json({ erro: "Emenda não encontrada" }, { status: 404 }) };
    }

    if (emenda.cidade.usuarios.length === 0) {
      return { erro: NextResponse.json({ erro: "Você não tem acesso a esta emenda" }, { status: 403 }) };
    }
  }

  // Se foi especificado um cliente, verifica se o usuário tem acesso
  if (clienteId) {
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      select: {
        id: true,
        cidadeId: true,
        cidade: {
          select: {
            usuarios: {
              where: {
                id: token.id as string,
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!cliente) {
      return { erro: NextResponse.json({ erro: "Cliente não encontrado" }, { status: 404 }) };
    }

    if (cliente.cidade.usuarios.length === 0) {
      return { erro: NextResponse.json({ erro: "Você não tem acesso a este cliente" }, { status: 403 }) };
    }
  }

  return { temAcesso: true, token };
}

/**
 * GET - Lista todos os equipamentos com paginação e filtros
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

    // Obtém os parâmetros de consulta
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || undefined;
    const tipo = searchParams.get("tipo") || undefined;
    const caixaId = searchParams.get("caixaId") || undefined;
    const emendaId = searchParams.get("emendaId") || undefined;
    const clienteId = searchParams.get("clienteId") || undefined;
    const cidadeId = searchParams.get("cidadeId") || undefined;

    // Calcula o offset para paginação
    const skip = (page - 1) * limit;

    // Constrói o filtro base
    const where: any = {};

    // Adiciona filtro de busca por nome, modelo, fabricante ou número de série
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { modelo: { contains: search, mode: "insensitive" } },
        { fabricante: { contains: search, mode: "insensitive" } },
        { numeroSerie: { contains: search, mode: "insensitive" } },
      ];
    }

    // Adiciona filtros específicos
    if (status) where.status = status;
    if (tipo) where.tipo = tipo;
    if (caixaId) where.caixaId = caixaId;
    if (emendaId) where.emendaId = emendaId;
    if (clienteId) where.clienteId = clienteId;

    // Filtro por cidade (baseado na cidade da caixa, emenda ou cliente)
    if (cidadeId) {
      where.OR = [
        { caixa: { cidadeId } },
        { emenda: { cidadeId } },
        { cliente: { cidadeId } },
      ];
    }

    // Se não for gerente, filtra por cidades que o usuário tem acesso
    if (token.cargo !== "Gerente") {
      const cidadesUsuario = await prisma.cidade.findMany({
        where: {
          usuarios: {
            some: {
              id: token.id as string,
            },
          },
        },
        select: {
          id: true,
        },
      });

      const cidadesIds = cidadesUsuario.map((cidade) => cidade.id);

      where.OR = [
        { caixa: { cidadeId: { in: cidadesIds } } },
        { emenda: { cidadeId: { in: cidadesIds } } },
        { cliente: { cidadeId: { in: cidadesIds } } },
      ];
    }

    // Conta o total de registros
    const total = await prisma.equipamento.count({ where });

    // Busca os equipamentos com paginação
    const equipamentos = await prisma.equipamento.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        caixa: {
          select: {
            id: true,
            nome: true,
            tipo: true,
            cidade: {
              select: {
                id: true,
                nome: true,
                estado: true,
              },
            },
          },
        },
        emenda: {
          select: {
            id: true,
            localizacao: true,
            cidade: {
              select: {
                id: true,
                nome: true,
                estado: true,
              },
            },
          },
        },
        cliente: {
          select: {
            id: true,
            nome: true,
            cidade: {
              select: {
                id: true,
                nome: true,
                estado: true,
              },
            },
          },
        },
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    // Calcula informações de paginação
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      equipamentos,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev,
      },
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * POST - Cria um novo equipamento
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem criar equipamentos)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = equipamentoSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const { caixaId, emendaId, clienteId } = result.data;

    // Verifica se o usuário tem acesso às entidades relacionadas
    const acesso = await verificarAcessoEntidade(req, caixaId, emendaId, clienteId);
    if (acesso.erro) return acesso.erro;

    // Obtém o token do usuário autenticado
    const token = acesso.token;

    // Cria o equipamento no banco de dados
    const equipamento = await prisma.equipamento.create({
      data: {
        ...result.data,
        usuarioId: token.id as string,
      },
    });

    // Registra a ação no log de auditoria
    await registrarLog({
      prisma,
      usuarioId: token.id as string,
      acao: "Criação",
      entidade: "Equipamento",
      entidadeId: equipamento.id,
      detalhes: result.data,
    });

    return NextResponse.json({
      mensagem: "Equipamento criado com sucesso",
      equipamento,
    });
  } catch (error) {
    return tratarErro(error);
  }
}