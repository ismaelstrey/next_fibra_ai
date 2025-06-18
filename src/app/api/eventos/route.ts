// src/app/api/eventos/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { tratarErro, verificarAutenticacao, registrarLog } from "../utils";
import { eventoSchema } from "./schema";

/**
 * Função auxiliar para verificar se o usuário tem acesso à entidade (caixa, rota, cidade)
 */
async function verificarAcessoEntidade(req: NextRequest, cidadeId?: string, caixaId?: string, rotaId?: string) {
  const token = await verificarAutenticacao(req);
  if (!token) {
    return { erro: NextResponse.json({ erro: "Não autorizado" }, { status: 401 }) };
  }

  // Gerentes têm acesso a todas as entidades
  if (token.cargo === "Gerente") {
    return { temAcesso: true, token };
  }

  // Se foi especificada uma cidade, verifica se o usuário tem acesso
  if (cidadeId) {
    const cidade = await prisma.cidade.findUnique({
      where: { id: cidadeId },
      select: {
        id: true,
        usuarios: {
          where: {
            id: token.id as string,
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!cidade) {
      return { erro: NextResponse.json({ erro: "Cidade não encontrada" }, { status: 404 }) };
    }

    if (cidade.usuarios.length === 0) {
      return { erro: NextResponse.json({ erro: "Você não tem acesso a esta cidade" }, { status: 403 }) };
    }
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

  // Se foi especificada uma rota, verifica se o usuário tem acesso
  if (rotaId) {
    const rota = await prisma.rota.findUnique({
      where: { id: rotaId },
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

    if (!rota) {
      return { erro: NextResponse.json({ erro: "Rota não encontrada" }, { status: 404 }) };
    }

    if (rota.cidade.usuarios.length === 0) {
      return { erro: NextResponse.json({ erro: "Você não tem acesso a esta rota" }, { status: 403 }) };
    }
  }

  return { temAcesso: true, token };
}

/**
 * GET - Lista todos os eventos com paginação e filtros
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

    // Obtém parâmetros de consulta
    const { searchParams } = new URL(req.url);
    const pagina = parseInt(searchParams.get("pagina") || "1");
    const limite = parseInt(searchParams.get("limite") || "10");
    const busca = searchParams.get("busca") || "";
    const tipo = searchParams.get("tipo");
    const status = searchParams.get("status");
    const cidadeId = searchParams.get("cidadeId");
    const caixaId = searchParams.get("caixaId");
    const rotaId = searchParams.get("rotaId");
    const manutencaoId = searchParams.get("manutencaoId");
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");
    const participanteId = searchParams.get("participanteId");

    // Calcula o offset para paginação
    const skip = (pagina - 1) * limite;

    // Constrói o filtro
    const where: any = {};

    // Adiciona filtro de busca por título ou descrição
    if (busca) {
      where.OR = [
        { titulo: { contains: busca, mode: "insensitive" } },
        { descricao: { contains: busca, mode: "insensitive" } },
      ];
    }

    // Adiciona filtro por tipo
    if (tipo) {
      where.tipo = tipo;
    }

    // Adiciona filtro por status
    if (status) {
      where.status = status;
    }

    // Adiciona filtro por cidade
    if (cidadeId) {
      where.cidadeId = cidadeId;
    }

    // Adiciona filtro por caixa
    if (caixaId) {
      where.caixaId = caixaId;
    }

    // Adiciona filtro por rota
    if (rotaId) {
      where.rotaId = rotaId;
    }

    // Adiciona filtro por manutenção
    if (manutencaoId) {
      where.manutencaoId = manutencaoId;
    }

    // Adiciona filtro por participante
    if (participanteId) {
      where.participantes = {
        some: {
          id: participanteId,
        },
      };
    }

    // Adiciona filtro por período
    if (dataInicio || dataFim) {
      where.dataInicio = {};

      if (dataInicio) {
        where.dataInicio.gte = new Date(dataInicio);
      }

      if (dataFim) {
        where.dataInicio.lte = new Date(dataFim);
      }
    }

    // Se não for gerente, filtra apenas eventos das cidades que o usuário tem acesso
    // ou eventos onde o usuário é participante
    if (token.cargo !== "Gerente") {
      where.OR = [
        ...(where.OR || []),
        {
          cidade: {
            usuarios: {
              some: {
                id: token.id as string,
              },
            },
          },
        },
        {
          caixa: {
            cidade: {
              usuarios: {
                some: {
                  id: token.id as string,
                },
              },
            },
          },
        },
        {
          rota: {
            cidade: {
              usuarios: {
                some: {
                  id: token.id as string,
                },
              },
            },
          },
        },
        {
          participantes: {
            some: {
              id: token.id as string,
            },
          },
        },
        {
          criadorId: token.id as string,
        },
      ];
    }

    // Consulta os eventos com paginação e filtros
    const [eventos, total] = await Promise.all([
      prisma.evento.findMany({
        where,
        select: {
          id: true,
          titulo: true,
          descricao: true,
          dataInicio: true,
          dataFim: true,
          tipo: true,
          status: true,
          criadoEm: true,
          atualizadoEm: true,
          cidadeId: true,
          caixaId: true,
          rotaId: true,
          usuarioId: true,
          _count: {
            select: {
              comentarios: true
            },
          },
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
              cargo: true,
              imagem: true,
            },
          },
          cidade: cidadeId ? {
            select: {
              id: true,
              nome: true,
              estado: true,
            },
          } : false,
          caixa: caixaId ? {
            select: {
              id: true,
              nome: true,
              tipo: true,
            },
          } : false,
          rota: rotaId ? {
            select: {
              id: true,
              nome: true,
              tipoCabo: true,
            },
          } : false,
          manutencao: manutencaoId ? {
            select: {
              id: true,
              titulo: true,
              status: true,
              tipo: true,
            },
          } : false,

        },
        skip,
        take: limite,
        orderBy: { dataInicio: "asc" },
      }),
      prisma.evento.count({ where }),
    ]);

    // Calcula metadados de paginação
    const totalPaginas = Math.ceil(total / limite);

    return NextResponse.json({
      eventos,
      paginacao: {
        total,
        pagina,
        limite,
        totalPaginas,
      },
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * POST - Cria um novo evento
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica se o usuário está autenticado
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json(
        { erro: "Não autorizado" },
        { status: 401 }
      );
    }

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = eventoSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const {
      titulo,
      descricao,
      dataInicio,
      dataFim,
      tipo,
      status,
      localizacao,
      cidadeId,
      caixaId,
      rotaId,
      manutencaoId,
      participantes
    } = result.data;

    // Verifica se o usuário tem acesso às entidades relacionadas
    const acesso = await verificarAcessoEntidade(req, cidadeId, caixaId, rotaId);
    if (acesso.erro) return acesso.erro;

    // Verifica se a manutenção existe, se especificada
    if (manutencaoId) {
      const manutencaoExiste = await prisma.manutencao.findUnique({
        where: { id: manutencaoId },
      });

      if (!manutencaoExiste) {
        return NextResponse.json(
          { erro: "Manutenção não encontrada" },
          { status: 404 }
        );
      }
    }

    // Verifica se os participantes existem
    if (participantes && participantes.length > 0) {
      const usuariosExistentes = await prisma.usuario.count({
        where: {
          id: {
            in: participantes,
          },
        },
      });

      if (usuariosExistentes !== participantes.length) {
        return NextResponse.json(
          { erro: "Um ou mais participantes não existem" },
          { status: 400 }
        );
      }
    }

    // Cria o evento no banco de dados
    const novoEvento = await prisma.evento.create({
      data: {
        titulo,
        descricao,
        dataInicio: new Date(dataInicio),
        dataFim: dataFim ? new Date(dataFim) : undefined,
        tipo,
        status,
        localizacao,
        cidadeId,
        caixaId,
        rotaId,
        usuarioId: acesso.token?.id as string,

      },
    });

    // Registra a ação no log de auditoria
    if (acesso.token) {
      await registrarLog({
        prisma,
        usuarioId: acesso.token.id as string,
        acao: "Criação",
        entidade: "Evento",
        entidadeId: novoEvento.id,
        detalhes: { titulo, tipo, status },
      });
    }

    // Retorna os dados do evento criado
    return NextResponse.json(
      { mensagem: "Evento criado com sucesso", evento: novoEvento },
      { status: 201 }
    );
  } catch (error) {
    return tratarErro(error);
  }
}