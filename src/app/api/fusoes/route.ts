// src/app/api/fusoes/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../utils";
import { fusaoSchema, criarFusoesEmLoteSchema } from "./schema";

/**
 * Função auxiliar para verificar se o usuário tem acesso à caixa
 */
async function verificarAcessoCaixa(req: NextRequest, caixaId: string) {
  const token = await verificarAutenticacao(req);
  if (!token) {
    return { erro: NextResponse.json({ erro: "Não autorizado" }, { status: 401 }) };
  }

  // Gerentes têm acesso a todas as caixas
  if (token.cargo === "Gerente") {
    return { temAcesso: true, token };
  }

  // Verifica se o usuário tem acesso à cidade da caixa
  const caixa = await prisma.caixa.findUnique({
    where: { id: caixaId },
    select: {
      cidadeId: true,
      tipo: true,
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

  return { temAcesso: true, token, caixa };
}

/**
 * GET - Lista todas as fusões com paginação e filtros
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
    const cidadeId = searchParams.get("cidadeId");
    const caixaId = searchParams.get("caixaId");
    const bandejaId = searchParams.get("bandejaId");

    // Calcula o offset para paginação
    const skip = (pagina - 1) * limite;

    // Constrói o filtro
    const where: any = {};

    // Adiciona filtro de busca por origem ou destino
    if (busca) {
      where.OR = [
        { origem: { contains: busca } },
        { destino: { contains: busca } },
      ];
    }

    // Adiciona filtro por caixa
    if (caixaId) {
      where.caixaId = caixaId;
    } else {
      // Se não for especificada uma caixa, filtra pelas cidades que o usuário tem acesso
      // Gerentes podem ver todas as cidades
      if (token.cargo !== "Gerente") {
        where.caixa = {
          cidade: {
            usuarios: {
              some: {
                id: token.id as string,
              },
            },
          },
        };
      }
    }

    // Adiciona filtro por cidade
    if (cidadeId) {
      where.caixa = {
        ...where.caixa,
        cidadeId,
      };
    }

    // Adiciona filtro por bandeja
    if (bandejaId) {
      where.bandejaId = bandejaId;
    }

    // Consulta as fusões com paginação e filtros
    const [fusoes, total] = await Promise.all([
      prisma.fusao.findMany({
        where,
        select: {
          id: true,
          fibraOrigem: true,
          fibraDestino: true,
          tuboOrigem: true,
          tuboDestino: true,
          status: true,
          cor: true,
          observacoes: true,
          criadoEm: true,
          atualizadoEm: true,
          caixaId: true,
          bandejaId: true,
          caixa: {
            select: {
              nome: true,
              tipo: true,
              cidade: {
                select: {
                  nome: true,
                  estado: true,
                },
              },
            },
          },
          bandeja: {
            select: {
              numero: true,
              capacidade: true,
            },
          },
        },
        skip,
        take: limite,
        orderBy: [
          { caixa: { nome: "asc" } },
          { bandeja: { numero: "asc" } },
          { fibraOrigem: "asc" },
        ],
      }),
      prisma.fusao.count({ where }),
    ]);

    // Calcula metadados de paginação
    const totalPaginas = Math.ceil(total / limite);

    return NextResponse.json({
      fusoes,
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
 * POST - Cria uma nova fusão
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica se o usuário tem permissão (Técnicos, Engenheiros e Gerentes podem criar fusões)
    const permissaoErro = await verificarPermissao(req, ["Técnico", "Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Verifica se é uma criação em lote ou individual
    const isLote = body.fusoes && Array.isArray(body.fusoes);

    if (isLote) {
      // Valida os dados com o esquema Zod para lote
      const result = criarFusoesEmLoteSchema.safeParse(body);

      // Se a validação falhar, retorna os erros
      if (!result.success) {
        return NextResponse.json(
          { erro: "Dados inválidos", detalhes: result.error.format() },
          { status: 400 }
        );
      }

      const { fusoes } = result.data;

      // Verifica se todas as fusões são para a mesma caixa
      const caixaIds = new Set(fusoes.map(f => f.caixaId));
      if (caixaIds.size !== 1) {
        return NextResponse.json(
          { erro: "Todas as fusões devem pertencer à mesma caixa" },
          { status: 400 }
        );
      }

      const caixaId = fusoes[0].caixaId;

      // Verifica se o usuário tem acesso à caixa
      const acesso = await verificarAcessoCaixa(req, caixaId);
      if (acesso.erro) return acesso.erro;

      // Verifica se a caixa é do tipo CEO
      if (acesso.caixa?.tipo !== "CEO") {
        return NextResponse.json(
          { erro: "Só é possível registrar fusões em caixas do tipo CEO" },
          { status: 400 }
        );
      }

      // Verifica se as bandejas existem e pertencem à caixa
      const bandejaIds = new Set(fusoes.filter(f => f.bandejaId).map(f => f.bandejaId));
      if (bandejaIds.size > 0) {
        const bandejas = await prisma.bandeja.findMany({
          where: {
            id: { in: Array.from(bandejaIds) || [] },
            caixaId,
          },
          select: {
            id: true,
            capacidade: true,
            _count: {
              select: {
                fusoes: true,
              },
            },
          },
        });

        if (bandejas.length !== bandejaIds.size) {
          return NextResponse.json(
            { erro: "Uma ou mais bandejas não existem ou não pertencem à caixa especificada" },
            { status: 400 }
          );
        }

        // Verifica se as bandejas têm capacidade disponível
        const fusoesPorBandeja = new Map();
        fusoes.forEach(f => {
          if (f.bandejaId) {
            fusoesPorBandeja.set(f.bandejaId, (fusoesPorBandeja.get(f.bandejaId) || 0) + 1);
          }
        });

        const bandejasLotadas = [];
        for (const bandeja of bandejas) {
          const novasFusoes = fusoesPorBandeja.get(bandeja.id) || 0;
          if (bandeja._count.fusoes + novasFusoes > bandeja.capacidade) {
            bandejasLotadas.push({
              id: bandeja.id,
              capacidade: bandeja.capacidade,
              fusoesExistentes: bandeja._count.fusoes,
              novasFusoes,
              excesso: bandeja._count.fusoes + novasFusoes - bandeja.capacidade,
            });
          }
        }

        if (bandejasLotadas.length > 0) {
          return NextResponse.json(
            {
              erro: "Uma ou mais bandejas não têm capacidade suficiente",
              detalhes: bandejasLotadas
            },
            { status: 400 }
          );
        }
      }

      // Cria as fusões no banco de dados
      const novasFusoes = await prisma.fusao.createMany({
        data: fusoes,
      });

      // Registra a ação no log de auditoria
      if (acesso.token) {
        await registrarLog({
          prisma,
          usuarioId: acesso.token.id as string,
          acao: "Criação em Lote",
          entidade: "Fusões",
          entidadeId: caixaId, // ID da caixa
          detalhes: { quantidade: fusoes.length },
        });
      }

      return NextResponse.json(
        { mensagem: `${novasFusoes.count} fusões criadas com sucesso` },
        { status: 201 }
      );
    } else {
      // Valida os dados com o esquema Zod para fusão individual
      const result = fusaoSchema.safeParse(body);

      // Se a validação falhar, retorna os erros
      if (!result.success) {
        return NextResponse.json(
          { erro: "Dados inválidos", detalhes: result.error.format() },
          { status: 400 }
        );
      }

      const {
        fibraOrigem,
        fibraDestino,
        tuboOrigem,
        tuboDestino,
        status,
        cor,
        observacoes,
        caixaId,
        bandejaId,
        rotaOrigemId
      } = result.data;

      // Verifica se o usuário tem acesso à caixa
      const acesso = await verificarAcessoCaixa(req, caixaId);
      if (acesso.erro) return acesso.erro;

      // Verifica se a caixa é do tipo CEO
      if (acesso.caixa?.tipo !== "CEO") {
        return NextResponse.json(
          { erro: "Só é possível registrar fusões em caixas do tipo CEO" },
          { status: 400 }
        );
      }

      // Se foi especificada uma bandeja, verifica se ela existe e pertence à caixa
      if (bandejaId) {
        const bandeja = await prisma.bandeja.findUnique({
          where: { id: bandejaId },
          select: {
            caixaId: true,
            capacidade: true,
            _count: {
              select: {
                fusoes: true,
              },
            },
          },
        });

        if (!bandeja) {
          return NextResponse.json(
            { erro: "Bandeja não encontrada" },
            { status: 404 }
          );
        }

        if (bandeja.caixaId !== caixaId) {
          return NextResponse.json(
            { erro: "A bandeja não pertence à caixa especificada" },
            { status: 400 }
          );
        }

        // Verifica se a bandeja tem capacidade disponível
        if (bandeja._count.fusoes >= bandeja.capacidade) {
          return NextResponse.json(
            {
              erro: "A bandeja não tem capacidade disponível",
              detalhes: {
                capacidade: bandeja.capacidade,
                fusoesExistentes: bandeja._count.fusoes
              }
            },
            { status: 400 }
          );
        }
      }

      // Cria a fusão no banco de dados
      const novaFusao = await prisma.fusao.create({
        data: {
          fibraOrigem,
          fibraDestino,
          tuboOrigem,
          tuboDestino,
          status,
          cor,
          observacoes,
          caixaId,
          bandejaId,
          rotaOrigemId,
        },
      });

      // Registra a ação no log de auditoria
      if (acesso.token) {
        await registrarLog({
          prisma,
          usuarioId: acesso.token.id as string,
          acao: "Criação",
          entidade: "Fusão",
          entidadeId: novaFusao.id,
          detalhes: { origem, destino, caixaId, bandejaId },
        });
      }

      // Retorna os dados da fusão criada
      return NextResponse.json(
        { mensagem: "Fusão criada com sucesso", fusao: novaFusao },
        { status: 201 }
      );
    }
  } catch (error) {
    return tratarErro(error);
  }
}