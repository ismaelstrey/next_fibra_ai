// src/app/api/arquivos/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../utils";
import { arquivoSchema } from "./schema";

/**
 * GET - Lista todos os arquivos com paginação e filtros
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
    const caixaId = searchParams.get("caixaId");
    const capilarId = searchParams.get("capilarId");
    const emendaId = searchParams.get("emendaId");
    const clienteId = searchParams.get("clienteId");

    // Calcula o offset para paginação
    const skip = (pagina - 1) * limite;

    // Constrói o filtro
    const where: any = {};

    // Adiciona filtro de busca por nome
    if (busca) {
      where.nome = { contains: busca, mode: "insensitive" };
    }

    // Adiciona filtro por tipo
    if (tipo) {
      where.tipo = { contains: tipo, mode: "insensitive" };
    }

    // Adiciona filtro por entidade relacionada
    if (caixaId) {
      where.caixaId = caixaId;
    }

    if (capilarId) {
      where.capilarId = capilarId;
    }

    if (emendaId) {
      where.emendaId = emendaId;
    }

    if (clienteId) {
      where.clienteId = clienteId;
    }

    // Consulta os arquivos com paginação e filtros
    const [arquivos, total] = await Promise.all([
      prisma.arquivo.findMany({
        where,
        select: {
          id: true,
          nome: true,
          tipo: true,
          url: true,
          tamanho: true,
          caixaId: true,
          capilarId: true,
          emendaId: true,
          clienteId: true,
          createdAt: true,
          updatedAt: true,
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
        },
        skip,
        take: limite,
        orderBy: { createdAt: "desc" },
      }),
      prisma.arquivo.count({ where }),
    ]);

    // Calcula metadados de paginação
    const totalPaginas = Math.ceil(total / limite);

    return NextResponse.json({
      arquivos,
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
 * POST - Cria um novo arquivo
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem criar arquivos)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = arquivoSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const { caixaId, capilarId, emendaId, clienteId } = result.data;

    // Verifica se as entidades relacionadas existem
    if (caixaId) {
      const caixa = await prisma.caixa.findUnique({
        where: { id: caixaId },
      });

      if (!caixa) {
        return NextResponse.json(
          { erro: "Caixa não encontrada" },
          { status: 404 }
        );
      }
    }

    if (capilarId) {
      const capilar = await prisma.capilar.findUnique({
        where: { id: capilarId },
      });

      if (!capilar) {
        return NextResponse.json(
          { erro: "Capilar não encontrado" },
          { status: 404 }
        );
      }
    }

    if (emendaId) {
      const emenda = await prisma.emenda.findUnique({
        where: { id: emendaId },
      });

      if (!emenda) {
        return NextResponse.json(
          { erro: "Emenda não encontrada" },
          { status: 404 }
        );
      }
    }

    if (clienteId) {
      const cliente = await prisma.cliente.findUnique({
        where: { id: clienteId },
      });

      if (!cliente) {
        return NextResponse.json(
          { erro: "Cliente não encontrado" },
          { status: 404 }
        );
      }
    }

    // Obtém o ID do usuário autenticado
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json(
        { erro: "Não autorizado" },
        { status: 401 }
      );
    }

    // Cria o arquivo no banco de dados
    const novoArquivo = await prisma.arquivo.create({
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
      entidade: "Arquivo",
      entidadeId: novoArquivo.id,
      detalhes: { nome: novoArquivo.nome, tipo: novoArquivo.tipo },
    });

    // Retorna os dados do arquivo criado
    return NextResponse.json(
      { mensagem: "Arquivo criado com sucesso", arquivo: novoArquivo },
      { status: 201 }
    );
  } catch (error) {
    return tratarErro(error);
  }
}