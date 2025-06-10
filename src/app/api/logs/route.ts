// src/app/api/logs/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao } from "../utils";
import { filtrarLogsSchema } from "./schema";

/**
 * GET - Lista logs de auditoria com filtros e paginação
 * Apenas usuários com cargo de Gerente podem acessar os logs
 */
export async function GET(req: NextRequest) {
  try {
    // Verifica autenticação
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    // Verifica se o usuário tem permissão de Gerente
    if (!(await verificarPermissao(req, ["Gerente"]))) {
      return NextResponse.json(
        { erro: "Você não tem permissão para acessar os logs de auditoria" },
        { status: 403 }
      );
    }

    // Extrai parâmetros de consulta
    const url = new URL(req.url);
    const busca = url.searchParams.get("busca") || undefined;
    const usuarioId = url.searchParams.get("usuarioId") || undefined;
    const acao = url.searchParams.get("acao") || undefined;
    const entidade = url.searchParams.get("entidade") || undefined;
    const entidadeId = url.searchParams.get("entidadeId") || undefined;
    const dataInicio = url.searchParams.get("dataInicio") || undefined;
    const dataFim = url.searchParams.get("dataFim") || undefined;
    const pagina = Number(url.searchParams.get("pagina")) || 1;
    const itensPorPagina = Number(url.searchParams.get("itensPorPagina")) || 10;

    // Valida os parâmetros de consulta
    const result = filtrarLogsSchema.safeParse({
      busca,
      usuarioId,
      acao,
      entidade,
      entidadeId,
      dataInicio,
      dataFim,
      pagina,
      itensPorPagina,
    });

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Parâmetros de consulta inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    // Constrói o filtro para a consulta
    const filtro: any = {};

    // Filtro por usuário
    if (usuarioId) {
      filtro.usuarioId = usuarioId;
    }

    // Filtro por ação
    if (acao) {
      filtro.acao = acao;
    }

    // Filtro por entidade
    if (entidade) {
      filtro.entidade = entidade;
    }

    // Filtro por ID de entidade
    if (entidadeId) {
      filtro.entidadeId = entidadeId;
    }

    // Filtro por período
    if (dataInicio || dataFim) {
      filtro.criadoEm = {};

      if (dataInicio) {
        filtro.criadoEm.gte = new Date(dataInicio);
      }

      if (dataFim) {
        filtro.criadoEm.lte = new Date(dataFim);
      }
    }

    // Filtro por termo de busca (em detalhes)
    if (busca) {
      filtro.OR = [
        { acao: { contains: busca, mode: "insensitive" } },
        { entidade: { contains: busca, mode: "insensitive" } },
        { entidadeId: { contains: busca, mode: "insensitive" } },
        { usuario: { nome: { contains: busca, mode: "insensitive" } } },
      ];
    }

    // Calcula o total de registros
    const total = await prisma.log.count({ where: filtro });

    // Calcula o total de páginas
    const totalPaginas = Math.ceil(total / itensPorPagina);

    // Busca os logs com paginação
    const logs = await prisma.log.findMany({
      where: filtro,
      select: {
        id: true,
        acao: true,
        entidade: true,
        entidadeId: true,
        detalhes: true,
        criadoEm: true,
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
      orderBy: {
        criadoEm: "desc",
      },
      skip: (pagina - 1) * itensPorPagina,
      take: itensPorPagina,
    });

    // Retorna os logs com informações de paginação
    return NextResponse.json({
      logs,
      paginacao: {
        total,
        totalPaginas,
        paginaAtual: pagina,
        itensPorPagina,
      },
    });
  } catch (error) {
    return tratarErro(error);
  }
}