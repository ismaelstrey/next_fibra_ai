// src/app/api/incidentes/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../utils";
import { incidenteSchema } from "./schema";

/**
 * Função auxiliar para verificar se o usuário tem acesso à entidade
 */
async function verificarAcessoEntidade(req: NextRequest, caixaId?: string, capilarId?: string, emendaId?: string, clienteId?: string, equipamentoId?: string) {
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

  // Se foi especificado um capilar, verifica se o usuário tem acesso
  if (capilarId) {
    const capilar = await prisma.capilar.findUnique({
      where: { id: capilarId },
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

    if (!capilar) {
      return { erro: NextResponse.json({ erro: "Capilar não encontrado" }, { status: 404 }) };
    }

    if (capilar?.cidade?.usuarios.length === 0) {
      return { erro: NextResponse.json({ erro: "Você não tem acesso a este capilar" }, { status: 403 }) };
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

    if (emenda?.cidade?.usuarios.length === 0) {
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

    if (cliente?.cidade?.usuarios.length === 0) {
      return { erro: NextResponse.json({ erro: "Você não tem acesso a este cliente" }, { status: 403 }) };
    }
  }

  // Se foi especificado um equipamento, verifica se o usuário tem acesso
  if (equipamentoId) {
    const equipamento = await prisma.equipamento.findUnique({
      where: { id: equipamentoId },
      include: {
        caixa: {
          select: {
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
        },
        emenda: {
          select: {
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
        },
        cliente: {
          select: {
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
        },
      },
    });

    if (!equipamento) {
      return { erro: NextResponse.json({ erro: "Equipamento não encontrado" }, { status: 404 }) };
    }

    // Verifica se o usuário tem acesso à cidade da caixa, emenda ou cliente associado ao equipamento
    let temAcesso = false;

    if (equipamento.caixa && equipamento.caixa.cidade?.usuarios?.length > 0) {
      temAcesso = true;
    }

    // if (!temAcesso && equipamento.emenda && equipamento.emenda.cidade?.usuarios?.length > 0) {
    //   temAcesso = true;
    // }

    // if (!temAcesso && equipamento.cliente && equipamento.cliente.cidade?.usuarios?.length > 0) {
    //   temAcesso = true;
    // }

    if (!temAcesso) {
      return { erro: NextResponse.json({ erro: "Você não tem acesso a este equipamento" }, { status: 403 }) };
    }
  }

  return { temAcesso: true, token };
}

/**
 * GET - Lista todos os incidentes com paginação e filtros
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
    const prioridade = searchParams.get("prioridade") || undefined;
    const impacto = searchParams.get("impacto") || undefined;
    const caixaId = searchParams.get("caixaId") || undefined;
    const capilarId = searchParams.get("capilarId") || undefined;
    const emendaId = searchParams.get("emendaId") || undefined;
    const clienteId = searchParams.get("clienteId") || undefined;
    const equipamentoId = searchParams.get("equipamentoId") || undefined;
    const cidadeId = searchParams.get("cidadeId") || undefined;

    // Calcula o offset para paginação
    const skip = (page - 1) * limit;

    // Constrói o filtro base
    const where: any = {};

    // Adiciona filtro de busca por título ou descrição
    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: "insensitive" } },
        { descricao: { contains: search, mode: "insensitive" } },
        { solucao: { contains: search, mode: "insensitive" } },
      ];
    }

    // Adiciona filtros específicos
    if (status) where.status = status;
    if (prioridade) where.prioridade = prioridade;
    if (impacto) where.impacto = impacto;
    if (caixaId) where.caixaId = caixaId;
    if (capilarId) where.capilarId = capilarId;
    if (emendaId) where.emendaId = emendaId;
    if (clienteId) where.clienteId = clienteId;
    if (equipamentoId) where.equipamentoId = equipamentoId;

    // Filtro por cidade (baseado na cidade da caixa, capilar, emenda, cliente ou equipamento)
    if (cidadeId) {
      where.OR = [
        { caixa: { cidadeId } },
        { capilar: { cidadeId } },
        { emenda: { cidadeId } },
        { cliente: { cidadeId } },
        { equipamento: { caixa: { cidadeId } } },
        { equipamento: { emenda: { cidadeId } } },
        { equipamento: { cliente: { cidadeId } } },
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
        { capilar: { cidadeId: { in: cidadesIds } } },
        { emenda: { cidadeId: { in: cidadesIds } } },
        { cliente: { cidadeId: { in: cidadesIds } } },
        { equipamento: { caixa: { cidadeId: { in: cidadesIds } } } },
        { equipamento: { emenda: { cidadeId: { in: cidadesIds } } } },
        { equipamento: { cliente: { cidadeId: { in: cidadesIds } } } },
      ];
    }

    // Conta o total de registros
    const total = await prisma.incidente.count({ where });

    // Busca os incidentes com paginação
    const incidentes = await prisma.incidente.findMany({
      where,
      skip,
      take: limit,
      orderBy: { criadoEm: "desc" },
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
        capilar: {
          select: {
            id: true,
            numero: true,
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
        equipamento: {
          select: {
            id: true,
            nome: true,
            modelo: true,
            tipo: true,
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
      incidentes,
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
 * POST - Cria um novo incidente
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica se o usuário tem permissão (Técnicos, Engenheiros e Gerentes podem criar incidentes)
    const permissaoErro = await verificarPermissao(req, ["Técnico", "Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = incidenteSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const { caixaId, capilarId, emendaId, clienteId, equipamentoId } = result.data;

    // Verifica se o usuário tem acesso às entidades relacionadas
    const acesso = await verificarAcessoEntidade(req, caixaId, capilarId, emendaId, clienteId, equipamentoId);
    if (acesso.erro) return acesso.erro;

    // Obtém o token do usuário autenticado
    const token = acesso.token;

    // Cria o incidente no banco de dados
    const incidente = await prisma.incidente.create({
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
      entidade: "Incidente",
      entidadeId: incidente.id,
      detalhes: result.data,
    });

    return NextResponse.json({
      mensagem: "Incidente criado com sucesso",
      incidente,
    });
  } catch (error) {
    return tratarErro(error);
  }
}