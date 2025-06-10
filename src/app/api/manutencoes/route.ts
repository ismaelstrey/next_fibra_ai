// src/app/api/manutencoes/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../utils";
import { manutencaoSchema } from "./schema";

/**
 * Função auxiliar para verificar se o usuário tem acesso à caixa ou rota
 */
async function verificarAcessoEntidade(req: NextRequest, caixaId?: string, rotaId?: string) {
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
 * GET - Lista todas as manutenções com paginação e filtros
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
    const rotaId = searchParams.get("rotaId");
    const status = searchParams.get("status"); // Agendada, Em Andamento, Concluída, Cancelada
    const tipo = searchParams.get("tipo"); // Preventiva, Corretiva, Emergencial
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");

    // Calcula o offset para paginação
    const skip = (pagina - 1) * limite;

    // Constrói o filtro
    const where: any = {};
    
    // Adiciona filtro de busca por título ou descrição
    if (busca) {
      where.OR = [
        { titulo: { contains: busca } },
        { descricao: { contains: busca } },
      ];
    }

    // Adiciona filtro por caixa
    if (caixaId) {
      where.caixaId = caixaId;
    }

    // Adiciona filtro por rota
    if (rotaId) {
      where.rotaId = rotaId;
    }

    // Adiciona filtro por status
    if (status) {
      where.status = status;
    }

    // Adiciona filtro por tipo
    if (tipo) {
      where.tipo = tipo;
    }

    // Adiciona filtro por data
    if (dataInicio || dataFim) {
      where.dataManutencao = {};
      
      if (dataInicio) {
        where.dataManutencao.gte = new Date(dataInicio);
      }
      
      if (dataFim) {
        where.dataManutencao.lte = new Date(dataFim);
      }
    }

    // Adiciona filtro por cidade (através da caixa ou rota)
    if (cidadeId) {
      where.OR = [
        ...(where.OR || []),
        {
          caixa: {
            cidadeId,
          },
        },
        {
          rota: {
            cidadeId,
          },
        },
      ];
    } else {
      // Se não for especificada uma cidade, filtra pelas cidades que o usuário tem acesso
      // Gerentes podem ver todas as cidades
      if (token.cargo !== "Gerente") {
        where.OR = [
          ...(where.OR || []),
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
        ];
      }
    }

    // Consulta as manutenções com paginação e filtros
    const [manutencoes, total] = await Promise.all([
      prisma.manutencao.findMany({
        where,
        select: {
          id: true,
          titulo: true,
          descricao: true,
          dataManutencao: true,
          status: true,
          tipo: true,
          criadoEm: true,
          atualizadoEm: true,
          caixaId: true,
          rotaId: true,
          usuarioId: true,
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
          rota: {
            select: {
              id: true,
              nome: true,
              tipoCabo: true,
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
              cargo: true,
              imagem: true,
            },
          },
        },
        skip,
        take: limite,
        orderBy: { dataManutencao: "desc" },
      }),
      prisma.manutencao.count({ where }),
    ]);

    // Calcula metadados de paginação
    const totalPaginas = Math.ceil(total / limite);

    return NextResponse.json({
      manutencoes,
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
 * POST - Cria uma nova manutenção
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica se o usuário tem permissão (Técnicos, Engenheiros e Gerentes podem criar manutenções)
    const permissaoErro = await verificarPermissao(req, ["Técnico", "Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    // Extrai os dados do corpo da requisição
    const body = await req.json();
    
    // Valida os dados com o esquema Zod
    const result = manutencaoSchema.safeParse(body);
    
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
      dataManutencao, 
      status, 
      tipo, 
      caixaId, 
      rotaId 
    } = result.data;
    
    // Verifica se o usuário tem acesso à caixa ou rota
    const acesso = await verificarAcessoEntidade(req, caixaId, rotaId);
    if (acesso.erro) return acesso.erro;
    
    // Cria a manutenção no banco de dados
    const novaManutencao = await prisma.manutencao.create({
      data: {
        titulo,
        descricao,
        dataManutencao: new Date(dataManutencao),
        status,
        tipo,
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
        entidade: "Manutenção",
        entidadeId: novaManutencao.id,
        detalhes: { titulo, status, tipo, caixaId, rotaId },
      });
    }
    
    // Retorna os dados da manutenção criada
    return NextResponse.json(
      { mensagem: "Manutenção criada com sucesso", manutencao: novaManutencao },
      { status: 201 }
    );
  } catch (error) {
    return tratarErro(error);
  }
}