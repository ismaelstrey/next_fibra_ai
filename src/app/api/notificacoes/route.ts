// src/app/api/notificacoes/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../utils";
import { notificacaoSchema } from "./schema";

/**
 * GET - Lista todas as notificações do usuário autenticado com paginação e filtros
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
    const prioridade = searchParams.get("prioridade");
    const lida = searchParams.get("lida");
    const cidadeId = searchParams.get("cidadeId");
    const caixaId = searchParams.get("caixaId");
    const rotaId = searchParams.get("rotaId");
    const manutencaoId = searchParams.get("manutencaoId");

    // Calcula o offset para paginação
    const skip = (pagina - 1) * limite;

    // Constrói o filtro
    const where: any = {
      // Filtra notificações do usuário autenticado
      OR: [
        { destinatarios: { some: { id: token.id as string } } },
        { cargoDestinatarios: { has: token.cargo } },
      ],
    };
    
    // Adiciona filtro de busca por título ou conteúdo
    if (busca) {
      where.OR = [
        ...(where.OR || []),
        { titulo: { contains: busca, mode: "insensitive" } },
        { conteudo: { contains: busca, mode: "insensitive" } },
      ];
    }

    // Adiciona filtro por tipo
    if (tipo) {
      where.tipo = tipo;
    }

    // Adiciona filtro por prioridade
    if (prioridade) {
      where.prioridade = prioridade;
    }

    // Adiciona filtro por status de leitura
    if (lida !== null && lida !== undefined) {
      const lidaBoolean = lida === "true";
      where.notificacoesLidas = {
        some: {
          usuarioId: token.id as string,
          lida: lidaBoolean,
        },
      };
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

    // Consulta as notificações com paginação e filtros
    const [notificacoes, total] = await Promise.all([
      prisma.notificacao.findMany({
        where,
        select: {
          id: true,
          titulo: true,
          conteudo: true,
          tipo: true,
          prioridade: true,
          criadoEm: true,
          atualizadoEm: true,
          cidadeId: true,
          caixaId: true,
          rotaId: true,
          manutencaoId: true,
          criadorId: true,
          notificacoesLidas: {
            where: {
              usuarioId: token.id as string,
            },
            select: {
              lida: true,
              lidaEm: true,
            },
          },
          criador: {
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
        orderBy: { criadoEm: "desc" },
      }),
      prisma.notificacao.count({ where }),
    ]);

    // Processa as notificações para adicionar o status de leitura
    const notificacoesProcessadas = notificacoes.map((notificacao) => {
      const statusLeitura = notificacao.notificacoesLidas[0] || { lida: false, lidaEm: null };
      const { notificacoesLidas, ...resto } = notificacao;
      return {
        ...resto,
        lida: statusLeitura.lida,
        lidaEm: statusLeitura.lidaEm,
      };
    });

    // Calcula metadados de paginação
    const totalPaginas = Math.ceil(total / limite);

    return NextResponse.json({
      notificacoes: notificacoesProcessadas,
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
 * POST - Cria uma nova notificação
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

    // Verifica se o usuário tem permissão para criar notificações
    // Apenas usuários com cargo de Engenheiro ou Gerente podem criar notificações
    if (!(await verificarPermissao(req, ["Engenheiro", "Gerente"]))) {
      return NextResponse.json(
        { erro: "Você não tem permissão para criar notificações" },
        { status: 403 }
      );
    }

    // Extrai os dados do corpo da requisição
    const body = await req.json();
    
    // Valida os dados com o esquema Zod
    const result = notificacaoSchema.safeParse(body);
    
    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }
    
    const { 
      titulo, 
      conteudo, 
      tipo, 
      prioridade, 
      destinatarios, 
      cargoDestinatarios,
      cidadeId,
      caixaId,
      rotaId,
      manutencaoId
    } = result.data;
    
    // Verifica se os destinatários existem
    if (destinatarios && destinatarios.length > 0) {
      const usuariosExistentes = await prisma.usuario.count({
        where: {
          id: {
            in: destinatarios,
          },
        },
      });

      if (usuariosExistentes !== destinatarios.length) {
        return NextResponse.json(
          { erro: "Um ou mais destinatários não existem" },
          { status: 400 }
        );
      }
    }

    // Verifica se a cidade existe, se especificada
    if (cidadeId) {
      const cidadeExiste = await prisma.cidade.findUnique({
        where: { id: cidadeId },
      });

      if (!cidadeExiste) {
        return NextResponse.json(
          { erro: "Cidade não encontrada" },
          { status: 404 }
        );
      }
    }

    // Verifica se a caixa existe, se especificada
    if (caixaId) {
      const caixaExiste = await prisma.caixa.findUnique({
        where: { id: caixaId },
      });

      if (!caixaExiste) {
        return NextResponse.json(
          { erro: "Caixa não encontrada" },
          { status: 404 }
        );
      }
    }

    // Verifica se a rota existe, se especificada
    if (rotaId) {
      const rotaExiste = await prisma.rota.findUnique({
        where: { id: rotaId },
      });

      if (!rotaExiste) {
        return NextResponse.json(
          { erro: "Rota não encontrada" },
          { status: 404 }
        );
      }
    }

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
    
    // Cria a notificação no banco de dados
    const novaNotificacao = await prisma.notificacao.create({
      data: {
        titulo,
        conteudo,
        tipo,
        prioridade,
        cidadeId,
        caixaId,
        rotaId,
        manutencaoId,
        criadorId: token.id as string,
        cargoDestinatarios: cargoDestinatarios?.join() || '',
        destinatarios: destinatarios ? {
          connect: destinatarios.map(id => ({ id })),
        } : undefined,
      },
    });
    
    // Registra a ação no log de auditoria
    await registrarLog({
      prisma,
      usuarioId: token.id as string,
      acao: "Criação",
      entidade: "Notificação",
      entidadeId: novaNotificacao.id,
      detalhes: { titulo, tipo, prioridade },
    });
    
    // Retorna os dados da notificação criada
    return NextResponse.json(
      { mensagem: "Notificação criada com sucesso", notificacao: novaNotificacao },
      { status: 201 }
    );
  } catch (error) {
    return tratarErro(error);
  }
}