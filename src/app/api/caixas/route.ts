// src/app/api/caixas/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../utils";
import { caixaSchema } from "./schema";

/**
 * GET - Lista todas as caixas com paginação e filtros
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
    const rotaId = searchParams.get("rotaId");
    const tipo = searchParams.get("tipo"); // CTO ou CEO

    // Calcula o offset para paginação
    const skip = (pagina - 1) * limite;

    interface Busca {
  
        nome?: string;
      cidadeId?: string;
      rotaId?: string;
      tipo?: string;
      cidade?: {
        usuarios: {
          some: {
            id: string;
          };
        };
      }
     
    }

    // Constrói o filtro
    const where: Busca  = { nome: undefined, cidadeId: undefined, rotaId: undefined, tipo: undefined};
    
    // Adiciona filtro de busca por nome
    if (busca) {
      where.nome =  busca
    }

    // Adiciona filtro por cidade
    if (cidadeId) {
      where.cidadeId = cidadeId;
    } else {
      // Se não for especificada uma cidade, filtra pelas cidades que o usuário tem acesso
      // Gerentes podem ver todas as cidades
      if (token.cargo !== "Gerente") {
        where.cidade = {
          usuarios: {
            some: {
              id: token.id as string,
            },
          },
        };
      }
    }

    // Adiciona filtro por rota
    if (rotaId) {
      where.rotaId = rotaId;
    }

    // Adiciona filtro por tipo
    if (tipo) {
      where.tipo = tipo;
    }

    // Consulta as caixas com paginação e filtros
    const [caixas, total] = await Promise.all([
      prisma.caixa.findMany({
        where,
        select: {
          id: true,
          nome: true,
          tipo: true,
          modelo: true,
          capacidade: true,
          coordenadas: true,
          observacoes: true,
          criadoEm: true,
          atualizadoEm: true,
          cidadeId: true,
          rotaId: true,
          cidade: {
            select: {
              nome: true,
              estado: true,
            },
          },
          rota: {
            select: {
              nome: true,
              tipoCabo: true,
            },
          },
          _count: {
            select: {
              fusoes: true,
              portas: true,
              bandejas: true,
              comentarios: true,
              arquivos: true,
              manutencoes: true,
            },
          },
        },
        skip,
        take: limite,
        orderBy: { nome: "asc" },
      }),
      prisma.caixa.count({ where }),
    ]);

    // Calcula metadados de paginação
    const totalPaginas = Math.ceil(total / limite);

    return NextResponse.json({
      caixas,
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
 * POST - Cria uma nova caixa
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem criar caixas)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    // Extrai os dados do corpo da requisição
    const body = await req.json();
    
    // Valida os dados com o esquema Zod
    const result = caixaSchema.safeParse(body);
    
    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }
    
    const { 
      nome, 
      tipo, 
      modelo, 
      capacidade, 
      coordenadas, 
      observacoes, 
      cidadeId, 
      rotaId 
    } = result.data;
    
    // Verifica se a cidade existe
    const cidade = await prisma.cidade.findUnique({
      where: { id: cidadeId },
    });
    
    if (!cidade) {
      return NextResponse.json(
        { erro: "Cidade não encontrada" },
        { status: 404 }
      );
    }

    // Verifica se a rota existe
    const rota = await prisma.rota.findUnique({
      where: { id: rotaId },
    });
    
    if (!rota) {
      return NextResponse.json(
        { erro: "Rota não encontrada" },
        { status: 404 }
      );
    }

    // Verifica se a rota pertence à cidade especificada
    if (rota.cidadeId !== cidadeId) {
      return NextResponse.json(
        { erro: "A rota não pertence à cidade especificada" },
        { status: 400 }
      );
    }

    // Verifica se o usuário tem acesso à cidade
    const token = await verificarAutenticacao(req);
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
    
    // Cria a caixa no banco de dados
    const novaCaixa = await prisma.caixa.create({
      data: {
        nome,
        tipo,
        modelo,
        capacidade,
        coordenadas,
        observacoes,
        cidadeId,
        rotaId,
      },
    });

    // Se for uma CTO, cria automaticamente as portas
    if (tipo === "CTO") {
      const portas = Array.from({ length: capacidade }, (_, i) => ({
        numero: i + 1,
        status: "Livre",
        caixaId: novaCaixa.id,
      }));

      await prisma.porta.createMany({
        data: portas,
      });
    }

    // Se for uma CEO, cria automaticamente as bandejas (assumindo 1 bandeja para cada 12 fibras)
    if (tipo === "CEO") {
      const numBandejas = Math.ceil(capacidade / 12);
      const bandejas = Array.from({ length: numBandejas }, (_, i) => ({
        numero: i + 1,
        capacidade: i === numBandejas - 1 && capacidade % 12 !== 0 ? capacidade % 12 : 12,
        caixaId: novaCaixa.id,
      }));

      await prisma.bandeja.createMany({
        data: bandejas,
      });
    }

    // Registra a ação no log de auditoria
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Criação",
        entidade: "Caixa",
        entidadeId: novaCaixa.id,
        detalhes: { nome, tipo, cidadeId, rotaId },
      });
    }
    
    // Retorna os dados da caixa criada
    return NextResponse.json(
      { mensagem: "Caixa criada com sucesso", caixa: novaCaixa },
      { status: 201 }
    );
  } catch (error) {
    return tratarErro(error);
  }
}