// src/app/api/comentarios/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../utils";
import { comentarioSchema } from "./schema";

/**
 * Função auxiliar para verificar se o usuário tem acesso à entidade (caixa ou rota)
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
 * GET - Lista todos os comentários com paginação e filtros
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
    const usuarioId = searchParams.get("usuarioId");

    // Calcula o offset para paginação
    const skip = (pagina - 1) * limite;

    // Constrói o filtro
    const where: any = {};
    
    // Adiciona filtro de busca por conteúdo
    if (busca) {
      where.conteudo = { contains: busca };
    }

    // Adiciona filtro por caixa
    if (caixaId) {
      where.caixaId = caixaId;
    }

    // Adiciona filtro por rota
    if (rotaId) {
      where.rotaId = rotaId;
    }

    // Adiciona filtro por usuário
    if (usuarioId) {
      where.usuarioId = usuarioId;
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

    // Consulta os comentários com paginação e filtros
    const [comentarios, total] = await Promise.all([
      prisma.comentario.findMany({
        where,
        select: {
          id: true,
          conteudo: true,
          criadoEm: true,
          atualizadoEm: true,
          caixaId: true,
          rotaId: true,
          usuarioId: true,
          caixa: caixaId ? {
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
          } : false,
          rota: rotaId ? {
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
          } : false,
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
        orderBy: { criadoEm: "desc" },
      }),
      prisma.comentario.count({ where }),
    ]);

    // Calcula metadados de paginação
    const totalPaginas = Math.ceil(total / limite);

    return NextResponse.json({
      comentarios,
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
 * POST - Cria um novo comentário
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
    const result = comentarioSchema.safeParse(body);
    
    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }
    
    const { conteudo, caixaId, rotaId } = result.data;
    
    // Verifica se o usuário tem acesso à caixa ou rota
    const acesso = await verificarAcessoEntidade(req, caixaId, rotaId);
    if (acesso.erro) return acesso.erro;
    
    // Cria o comentário no banco de dados
    const novoComentario = await prisma.comentario.create({
      data: {
        texto: conteudo,
        conteudo,
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
        entidade: "Comentário",
        entidadeId: novoComentario.id,
        detalhes: { caixaId, rotaId },
      });
    }
    
    // Retorna os dados do comentário criado
    return NextResponse.json(
      { mensagem: "Comentário criado com sucesso", comentario: novoComentario },
      { status: 201 }
    );
  } catch (error) {
    return tratarErro(error);
  }
}