// src/app/api/estatisticas/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarAutenticacao, tratarErro } from "../utils";
import { consultaEstatisticasSchema } from "./schema";

/**
 * GET - Obtém estatísticas do sistema com base nos parâmetros fornecidos
 */
export async function GET(req: NextRequest) {
  try {
    // Verifica autenticação
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    // Extrai parâmetros de consulta
    const url = new URL(req.url);
    const tipo = url.searchParams.get("tipo") || "manutencoes";
    const dataInicio = url.searchParams.get("dataInicio") || undefined;
    const dataFim = url.searchParams.get("dataFim") || undefined;
    const cidadeId = url.searchParams.get("cidadeId") || undefined;
    const usuarioId = url.searchParams.get("usuarioId") || undefined;
    const agruparPor = url.searchParams.get("agruparPor") || "mes";

    // Valida os parâmetros de consulta
    const result = consultaEstatisticasSchema.safeParse({
      tipo,
      dataInicio,
      dataFim,
      cidadeId,
      usuarioId,
      agruparPor,
    });

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Parâmetros de consulta inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    // Prepara o filtro de período
    const filtroData: any = {};
    if (dataInicio) {
      filtroData.gte = new Date(dataInicio);
    }
    if (dataFim) {
      filtroData.lte = new Date(dataFim);
    }

    // Prepara o filtro de cidade para usuários não gerentes
    let filtroCidades: any = {};
    if (token.cargo !== "Gerente" && !cidadeId) {
      // Busca as cidades que o usuário tem acesso
      const cidadesUsuario = await prisma.cidade.findMany({
        where: {
          usuarios: {
            some: {
              id: token.sub as string,
            },
          },
        },
        select: {
          id: true,
        },
      });

      if (cidadesUsuario.length > 0) {
        filtroCidades = {
          in: cidadesUsuario.map((cidade) => cidade.id),
        };
      }
    } else if (cidadeId) {
      filtroCidades = cidadeId;
    }

    // Obtém estatísticas com base no tipo solicitado
    let estatisticas;

    switch (tipo) {
      case "manutencoes":
        estatisticas = await obterEstatisticasManutencoes({
          filtroData,
          filtroCidades,
          usuarioId,
          agruparPor,
        });
        break;

      case "caixas":
        estatisticas = await obterEstatisticasCaixas({
          filtroData,
          filtroCidades,
          agruparPor,
        });
        break;

      case "rotas":
        estatisticas = await obterEstatisticasRotas({
          filtroData,
          filtroCidades,
          agruparPor,
        });
        break;

      case "usuarios":
        // Apenas gerentes podem ver estatísticas de todos os usuários
        if (token.cargo !== "Gerente" && usuarioId !== token.sub) {
          return NextResponse.json(
            { erro: "Você não tem permissão para acessar estatísticas de outros usuários" },
            { status: 403 }
          );
        }
        estatisticas = await obterEstatisticasUsuarios({
          filtroData,
          filtroCidades,
          usuarioId: usuarioId || (token.sub as string),
          agruparPor,
        });
        break;

      case "cidades":
        estatisticas = await obterEstatisticasCidades({
          filtroData,
          filtroCidades,
          agruparPor,
        });
        break;

      case "eventos":
        estatisticas = await obterEstatisticasEventos({
          filtroData,
          filtroCidades,
          usuarioId,
          agruparPor,
        });
        break;

      case "atividade":
        // Apenas gerentes podem ver estatísticas de atividade geral
        if (token.cargo !== "Gerente" && usuarioId !== token.sub) {
          return NextResponse.json(
            { erro: "Você não tem permissão para acessar estatísticas de atividade geral" },
            { status: 403 }
          );
        }
        estatisticas = await obterEstatisticasAtividade({
          filtroData,
          usuarioId: usuarioId || (token.cargo === "Gerente" ? undefined : token.sub as string),
          agruparPor,
        });
        break;

      default:
        return NextResponse.json(
          { erro: "Tipo de estatística não suportado" },
          { status: 400 }
        );
    }

    // Retorna as estatísticas
    return NextResponse.json(estatisticas);
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * Obtém estatísticas de manutenções
 */
async function obterEstatisticasManutencoes({
  filtroData,
  filtroCidades,
  usuarioId,
  agruparPor,
}: {
  filtroData: any;
  filtroCidades: any;
  usuarioId?: string;
  agruparPor: string;
}) {
  // Filtro base para manutenções
  const filtro: any = {};

  // Adiciona filtro de data se fornecido
  if (Object.keys(filtroData).length > 0) {
    filtro.criadoEm = filtroData;
  }

  // Adiciona filtro de cidade se fornecido
  if (typeof filtroCidades === "string") {
    filtro.cidadeId = filtroCidades;
  } else if (filtroCidades.in && filtroCidades.in.length > 0) {
    filtro.cidadeId = filtroCidades;
  }

  // Adiciona filtro de usuário se fornecido
  if (usuarioId) {
    filtro.responsavelId = usuarioId;
  }

  // Contagem total de manutenções
  const totalManutencoes = await prisma.manutencao.count({
    where: filtro,
  });

  // Contagem por status
  const contagemPorStatus = await prisma.manutencao.groupBy({
    by: ["status"],
    where: filtro,
    _count: true,
  });

  // Contagem por tipo
  const contagemPorTipo = await prisma.manutencao.groupBy({
    by: ["tipo"],
    where: filtro,
    _count: true,
  });

  // Contagem por prioridade
  const contagemPorPrioridade = await prisma.manutencao.groupBy({
    by: ["prioridade"],
    where: filtro,
    _count: true,
  });

  // Tempo médio de resolução (em dias)
  const tempoMedioResolucao = await prisma.$queryRaw`
    SELECT AVG(EXTRACT(EPOCH FROM ("dataFechamento" - "dataAbertura")) / 86400) as "tempoMedio"
    FROM "Manutencao"
    WHERE "dataFechamento" IS NOT NULL
    ${Object.keys(filtro).length > 0 ? prisma.$queryRaw`AND ${prisma.sql(JSON.stringify(filtro))}` : prisma.$queryRaw``}
  `;

  // Manutenções por período (dia, semana, mês, ano)
  let manutencoesAoLongo;
  
  if (agruparPor === "dia") {
    manutencoesAoLongo = await prisma.$queryRaw`
      SELECT DATE("criadoEm") as data, COUNT(*) as total
      FROM "Manutencao"
      WHERE ${Object.keys(filtro).length > 0 ? prisma.sql(JSON.stringify(filtro)) : prisma.sql(`1=1`)}
      GROUP BY DATE("criadoEm")
      ORDER BY data
    `;
  } else if (agruparPor === "semana") {
    manutencoesAoLongo = await prisma.$queryRaw`
      SELECT DATE_TRUNC('week', "criadoEm") as data, COUNT(*) as total
      FROM "Manutencao"
      WHERE ${Object.keys(filtro).length > 0 ? prisma.sql(JSON.stringify(filtro)) : prisma.sql(`1=1`)}
      GROUP BY DATE_TRUNC('week', "criadoEm")
      ORDER BY data
    `;
  } else if (agruparPor === "mes") {
    manutencoesAoLongo = await prisma.$queryRaw`
      SELECT DATE_TRUNC('month', "criadoEm") as data, COUNT(*) as total
      FROM "Manutencao"
      WHERE ${Object.keys(filtro).length > 0 ? prisma.sql(JSON.stringify(filtro)) : prisma.sql(`1=1`)}
      GROUP BY DATE_TRUNC('month', "criadoEm")
      ORDER BY data
    `;
  } else { // ano
    manutencoesAoLongo = await prisma.$queryRaw`
      SELECT DATE_TRUNC('year', "criadoEm") as data, COUNT(*) as total
      FROM "Manutencao"
      WHERE ${Object.keys(filtro).length > 0 ? prisma.sql(JSON.stringify(filtro)) : prisma.sql(`1=1`)}
      GROUP BY DATE_TRUNC('year', "criadoEm")
      ORDER BY data
    `;
  }

  return {
    total: totalManutencoes,
    porStatus: contagemPorStatus.map(item => ({
      status: item.status,
      total: item._count,
    })),
    porTipo: contagemPorTipo.map(item => ({
      tipo: item.tipo,
      total: item._count,
    })),
    porPrioridade: contagemPorPrioridade.map(item => ({
      prioridade: item.prioridade,
      total: item._count,
    })),
    tempoMedioResolucao: (tempoMedioResolucao as any)[0]?.tempoMedio || 0,
    aoLongoDoPeriodo: manutencoesAoLongo,
  };
}

/**
 * Obtém estatísticas de caixas
 */
async function obterEstatisticasCaixas({
  filtroData,
  filtroCidades,
  agruparPor,
}: {
  filtroData: any;
  filtroCidades: any;
  agruparPor: string;
}) {
  // Filtro base para caixas
  const filtro: any = {};

  // Adiciona filtro de cidade se fornecido
  if (typeof filtroCidades === "string") {
    filtro.cidadeId = filtroCidades;
  } else if (filtroCidades.in && filtroCidades.in.length > 0) {
    filtro.cidadeId = filtroCidades;
  }

  // Contagem total de caixas
  const totalCaixas = await prisma.caixa.count({
    where: filtro,
  });

  // Contagem por tipo
  const contagemPorTipo = await prisma.caixa.groupBy({
    by: ["tipo"],
    where: filtro,
    _count: true,
  });

  // Contagem por status
  const contagemPorStatus = await prisma.caixa.groupBy({
    by: ["status"],
    where: filtro,
    _count: true,
  });

  // Contagem por cidade
  const contagemPorCidade = await prisma.caixa.groupBy({
    by: ["cidadeId"],
    where: filtro,
    _count: true,
  });

  // Busca detalhes das cidades para incluir nomes
  const cidades = await prisma.cidade.findMany({
    where: {
      id: {
        in: contagemPorCidade.map(item => item.cidadeId),
      },
    },
    select: {
      id: true,
      nome: true,
    },
  });

  // Manutenções por caixa (top 10)
  const manutencoesPorCaixa = await prisma.manutencao.groupBy({
    by: ["caixaId"],
    where: {
      caixaId: { not: null },
      ...(Object.keys(filtroData).length > 0 ? { criadoEm: filtroData } : {}),
    },
    _count: true,
    orderBy: {
      _count: {
        desc: true,
      },
    },
    take: 10,
  });

  // Busca detalhes das caixas para incluir nomes
  const caixasComMaisManutencoes = await prisma.caixa.findMany({
    where: {
      id: {
        in: manutencoesPorCaixa.map(item => item.caixaId as string),
      },
    },
    select: {
      id: true,
      nome: true,
      tipo: true,
      cidade: {
        select: {
          nome: true,
        },
      },
    },
  });

  return {
    total: totalCaixas,
    porTipo: contagemPorTipo.map(item => ({
      tipo: item.tipo,
      total: item._count,
    })),
    porStatus: contagemPorStatus.map(item => ({
      status: item.status,
      total: item._count,
    })),
    porCidade: contagemPorCidade.map(item => ({
      cidadeId: item.cidadeId,
      nomeCidade: cidades.find(cidade => cidade.id === item.cidadeId)?.nome || "Desconhecida",
      total: item._count,
    })),
    caixasComMaisManutencoes: manutencoesPorCaixa.map(item => ({
      caixaId: item.caixaId,
      nome: caixasComMaisManutencoes.find(caixa => caixa.id === item.caixaId)?.nome || "Desconhecida",
      tipo: caixasComMaisManutencoes.find(caixa => caixa.id === item.caixaId)?.tipo || "Desconhecido",
      cidade: caixasComMaisManutencoes.find(caixa => caixa.id === item.caixaId)?.cidade.nome || "Desconhecida",
      totalManutencoes: item._count,
    })),
  };
}

/**
 * Obtém estatísticas de rotas
 */
async function obterEstatisticasRotas({
  filtroData,
  filtroCidades,
  agruparPor,
}: {
  filtroData: any;
  filtroCidades: any;
  agruparPor: string;
}) {
  // Filtro base para rotas
  const filtro: any = {};

  // Adiciona filtro de cidade se fornecido
  if (typeof filtroCidades === "string") {
    filtro.cidadeId = filtroCidades;
  } else if (filtroCidades.in && filtroCidades.in.length > 0) {
    filtro.cidadeId = filtroCidades;
  }

  // Contagem total de rotas
  const totalRotas = await prisma.rota.count({
    where: filtro,
  });

  // Contagem por tipo de cabo
  const contagemPorTipoCabo = await prisma.rota.groupBy({
    by: ["tipoCabo"],
    where: filtro,
    _count: true,
  });

  // Contagem por status
  const contagemPorStatus = await prisma.rota.groupBy({
    by: ["status"],
    where: filtro,
    _count: true,
  });

  // Contagem por cidade
  const contagemPorCidade = await prisma.rota.groupBy({
    by: ["cidadeId"],
    where: filtro,
    _count: true,
  });

  // Busca detalhes das cidades para incluir nomes
  const cidades = await prisma.cidade.findMany({
    where: {
      id: {
        in: contagemPorCidade.map(item => item.cidadeId),
      },
    },
    select: {
      id: true,
      nome: true,
    },
  });

  // Manutenções por rota (top 10)
  const manutencoesPorRota = await prisma.manutencao.groupBy({
    by: ["rotaId"],
    where: {
      rotaId: { not: null },
      ...(Object.keys(filtroData).length > 0 ? { criadoEm: filtroData } : {}),
    },
    _count: true,
    orderBy: {
      _count: {
        desc: true,
      },
    },
    take: 10,
  });

  // Busca detalhes das rotas para incluir nomes
  const rotasComMaisManutencoes = await prisma.rota.findMany({
    where: {
      id: {
        in: manutencoesPorRota.map(item => item.rotaId as string),
      },
    },
    select: {
      id: true,
      nome: true,
      tipoCabo: true,
      cidade: {
        select: {
          nome: true,
        },
      },
    },
  });

  return {
    total: totalRotas,
    porTipoCabo: contagemPorTipoCabo.map(item => ({
      tipoCabo: item.tipoCabo,
      total: item._count,
    })),
    porStatus: contagemPorStatus.map(item => ({
      status: item.status,
      total: item._count,
    })),
    porCidade: contagemPorCidade.map(item => ({
      cidadeId: item.cidadeId,
      nomeCidade: cidades.find(cidade => cidade.id === item.cidadeId)?.nome || "Desconhecida",
      total: item._count,
    })),
    rotasComMaisManutencoes: manutencoesPorRota.map(item => ({
      rotaId: item.rotaId,
      nome: rotasComMaisManutencoes.find(rota => rota.id === item.rotaId)?.nome || "Desconhecida",
      tipoCabo: rotasComMaisManutencoes.find(rota => rota.id === item.rotaId)?.tipoCabo || "Desconhecido",
      cidade: rotasComMaisManutencoes.find(rota => rota.id === item.rotaId)?.cidade.nome || "Desconhecida",
      totalManutencoes: item._count,
    })),
  };
}

/**
 * Obtém estatísticas de usuários
 */
async function obterEstatisticasUsuarios({
  filtroData,
  filtroCidades,
  usuarioId,
  agruparPor,
}: {
  filtroData: any;
  filtroCidades: any;
  usuarioId?: string;
  agruparPor: string;
}) {
  // Filtro base para usuários
  const filtro: any = {};

  // Adiciona filtro de usuário específico se fornecido
  if (usuarioId) {
    filtro.id = usuarioId;
  }

  // Contagem total de usuários
  const totalUsuarios = await prisma.usuario.count({
    where: filtro,
  });

  // Contagem por cargo
  const contagemPorCargo = await prisma.usuario.groupBy({
    by: ["cargo"],
    where: filtro,
    _count: true,
  });

  // Manutenções por usuário (top 10)
  const manutencoesPorUsuario = await prisma.manutencao.groupBy({
    by: ["responsavelId"],
    where: {
      responsavelId: { not: null },
      ...(Object.keys(filtroData).length > 0 ? { criadoEm: filtroData } : {}),
      ...(usuarioId ? { responsavelId: usuarioId } : {}),
    },
    _count: true,
    orderBy: {
      _count: {
        desc: true,
      },
    },
    take: usuarioId ? 1 : 10,
  });

  // Busca detalhes dos usuários para incluir nomes
  const usuariosComMaisManutencoes = await prisma.usuario.findMany({
    where: {
      id: {
        in: manutencoesPorUsuario.map(item => item.responsavelId as string),
      },
    },
    select: {
      id: true,
      nome: true,
      cargo: true,
    },
  });

  // Atividades por usuário
  const atividadesPorUsuario = await prisma.atividade.groupBy({
    by: ["usuarioId", "tipo"],
    where: {
      ...(Object.keys(filtroData).length > 0 ? { criadoEm: filtroData } : {}),
      ...(usuarioId ? { usuarioId } : {}),
    },
    _count: true,
  });

  // Organiza as atividades por usuário e tipo
  const atividadesAgrupadas: Record<string, Record<string, number>> = {};
  atividadesPorUsuario.forEach(item => {
    if (!atividadesAgrupadas[item.usuarioId]) {
      atividadesAgrupadas[item.usuarioId] = {};
    }
    atividadesAgrupadas[item.usuarioId][item.tipo] = item._count;
  });

  // Busca detalhes dos usuários para incluir nomes nas atividades
  const usuariosComAtividades = await prisma.usuario.findMany({
    where: {
      id: {
        in: Object.keys(atividadesAgrupadas),
      },
    },
    select: {
      id: true,
      nome: true,
      cargo: true,
    },
  });

  return {
    total: totalUsuarios,
    porCargo: contagemPorCargo.map(item => ({
      cargo: item.cargo,
      total: item._count,
    })),
    usuariosComMaisManutencoes: manutencoesPorUsuario.map(item => ({
      usuarioId: item.responsavelId,
      nome: usuariosComMaisManutencoes.find(usuario => usuario.id === item.responsavelId)?.nome || "Desconhecido",
      cargo: usuariosComMaisManutencoes.find(usuario => usuario.id === item.responsavelId)?.cargo || "Desconhecido",
      totalManutencoes: item._count,
    })),
    atividades: Object.keys(atividadesAgrupadas).map(usuarioId => ({
      usuarioId,
      nome: usuariosComAtividades.find(usuario => usuario.id === usuarioId)?.nome || "Desconhecido",
      cargo: usuariosComAtividades.find(usuario => usuario.id === usuarioId)?.cargo || "Desconhecido",
      atividades: atividadesAgrupadas[usuarioId],
    })),
  };
}

/**
 * Obtém estatísticas de cidades
 */
async function obterEstatisticasCidades({
  filtroData,
  filtroCidades,
  agruparPor,
}: {
  filtroData: any;
  filtroCidades: any;
  agruparPor: string;
}) {
  // Filtro base para cidades
  const filtro: any = {};

  // Adiciona filtro de cidade específica se fornecido
  if (typeof filtroCidades === "string") {
    filtro.id = filtroCidades;
  } else if (filtroCidades.in && filtroCidades.in.length > 0) {
    filtro.id = filtroCidades;
  }

  // Contagem total de cidades
  const totalCidades = await prisma.cidade.count({
    where: filtro,
  });

  // Contagem por estado
  const contagemPorEstado = await prisma.cidade.groupBy({
    by: ["estado"],
    where: filtro,
    _count: true,
  });

  // Contagem de caixas por cidade
  const caixasPorCidade = await prisma.caixa.groupBy({
    by: ["cidadeId"],
    where: {
      ...(typeof filtroCidades === "string" ? { cidadeId: filtroCidades } : {}),
      ...(filtroCidades.in && filtroCidades.in.length > 0 ? { cidadeId: filtroCidades } : {}),
    },
    _count: true,
  });

  // Contagem de rotas por cidade
  const rotasPorCidade = await prisma.rota.groupBy({
    by: ["cidadeId"],
    where: {
      ...(typeof filtroCidades === "string" ? { cidadeId: filtroCidades } : {}),
      ...(filtroCidades.in && filtroCidades.in.length > 0 ? { cidadeId: filtroCidades } : {}),
    },
    _count: true,
  });

  // Contagem de manutenções por cidade
  const manutencoesPorCidade = await prisma.manutencao.groupBy({
    by: ["cidadeId"],
    where: {
      ...(typeof filtroCidades === "string" ? { cidadeId: filtroCidades } : {}),
      ...(filtroCidades.in && filtroCidades.in.length > 0 ? { cidadeId: filtroCidades } : {}),
      ...(Object.keys(filtroData).length > 0 ? { criadoEm: filtroData } : {}),
    },
    _count: true,
  });

  // Busca detalhes das cidades para incluir nomes
  const cidades = await prisma.cidade.findMany({
    where: filtro,
    select: {
      id: true,
      nome: true,
      estado: true,
    },
  });

  // Combina os dados para criar um resumo por cidade
  const resumoPorCidade = cidades.map(cidade => ({
    id: cidade.id,
    nome: cidade.nome,
    estado: cidade.estado,
    totalCaixas: caixasPorCidade.find(item => item.cidadeId === cidade.id)?._count || 0,
    totalRotas: rotasPorCidade.find(item => item.cidadeId === cidade.id)?._count || 0,
    totalManutencoes: manutencoesPorCidade.find(item => item.cidadeId === cidade.id)?._count || 0,
  }));

  return {
    total: totalCidades,
    porEstado: contagemPorEstado.map(item => ({
      estado: item.estado,
      total: item._count,
    })),
    resumoPorCidade,
  };
}

/**
 * Obtém estatísticas de eventos
 */
async function obterEstatisticasEventos({
  filtroData,
  filtroCidades,
  usuarioId,
  agruparPor,
}: {
  filtroData: any;
  filtroCidades: any;
  usuarioId?: string;
  agruparPor: string;
}) {
  // Filtro base para eventos
  const filtro: any = {};

  // Adiciona filtro de data se fornecido
  if (Object.keys(filtroData).length > 0) {
    filtro.dataInicio = filtroData;
  }

  // Adiciona filtro de cidade se fornecido
  if (typeof filtroCidades === "string") {
    filtro.cidadeId = filtroCidades;
  } else if (filtroCidades.in && filtroCidades.in.length > 0) {
    filtro.cidadeId = filtroCidades;
  }

  // Adiciona filtro de usuário se fornecido
  if (usuarioId) {
    filtro.criadorId = usuarioId;
  }

  // Contagem total de eventos
  const totalEventos = await prisma.evento.count({
    where: filtro,
  });

  // Contagem por tipo
  const contagemPorTipo = await prisma.evento.groupBy({
    by: ["tipo"],
    where: filtro,
    _count: true,
  });

  // Contagem por status
  const contagemPorStatus = await prisma.evento.groupBy({
    by: ["status"],
    where: filtro,
    _count: true,
  });

  // Eventos por período (dia, semana, mês, ano)
  let eventosAoLongo;
  
  if (agruparPor === "dia") {
    eventosAoLongo = await prisma.$queryRaw`
      SELECT DATE("dataInicio") as data, COUNT(*) as total
      FROM "Evento"
      WHERE ${Object.keys(filtro).length > 0 ? prisma.sql(JSON.stringify(filtro)) : prisma.sql(`1=1`)}
      GROUP BY DATE("dataInicio")
      ORDER BY data
    `;
  } else if (agruparPor === "semana") {
    eventosAoLongo = await prisma.$queryRaw`
      SELECT DATE_TRUNC('week', "dataInicio") as data, COUNT(*) as total
      FROM "Evento"
      WHERE ${Object.keys(filtro).length > 0 ? prisma.sql(JSON.stringify(filtro)) : prisma.sql(`1=1`)}
      GROUP BY DATE_TRUNC('week', "dataInicio")
      ORDER BY data
    `;
  } else if (agruparPor === "mes") {
    eventosAoLongo = await prisma.$queryRaw`
      SELECT DATE_TRUNC('month', "dataInicio") as data, COUNT(*) as total
      FROM "Evento"
      WHERE ${Object.keys(filtro).length > 0 ? prisma.sql(JSON.stringify(filtro)) : prisma.sql(`1=1`)}
      GROUP BY DATE_TRUNC('month', "dataInicio")
      ORDER BY data
    `;
  } else { // ano
    eventosAoLongo = await prisma.$queryRaw`
      SELECT DATE_TRUNC('year', "dataInicio") as data, COUNT(*) as total
      FROM "Evento"
      WHERE ${Object.keys(filtro).length > 0 ? prisma.sql(JSON.stringify(filtro)) : prisma.sql(`1=1`)}
      GROUP BY DATE_TRUNC('year', "dataInicio")
      ORDER BY data
    `;
  }

  return {
    total: totalEventos,
    porTipo: contagemPorTipo.map(item => ({
      tipo: item.tipo,
      total: item._count,
    })),
    porStatus: contagemPorStatus.map(item => ({
      status: item.status,
      total: item._count,
    })),
    aoLongoDoPeriodo: eventosAoLongo,
  };
}

/**
 * Obtém estatísticas de atividade
 */
async function obterEstatisticasAtividade({
  filtroData,
  usuarioId,
  agruparPor,
}: {
  filtroData: any;
  usuarioId?: string;
  agruparPor: string;
}) {
  // Filtro base para atividades
  const filtro: any = {};

  // Adiciona filtro de data se fornecido
  if (Object.keys(filtroData).length > 0) {
    filtro.criadoEm = filtroData;
  }

  // Adiciona filtro de usuário se fornecido
  if (usuarioId) {
    filtro.usuarioId = usuarioId;
  }

  // Contagem total de atividades
  const totalAtividades = await prisma.atividade.count({
    where: filtro,
  });

  // Contagem por tipo
  const contagemPorTipo = await prisma.atividade.groupBy({
    by: ["tipo"],
    where: filtro,
    _count: true,
  });

  // Atividades por período (dia, semana, mês, ano)
  let atividadesAoLongo;
  
  if (agruparPor === "dia") {
    atividadesAoLongo = await prisma.$queryRaw`
      SELECT DATE("criadoEm") as data, COUNT(*) as total
      FROM "Atividade"
      WHERE ${Object.keys(filtro).length > 0 ? prisma.sql(JSON.stringify(filtro)) : prisma.sql(`1=1`)}
      GROUP BY DATE("criadoEm")
      ORDER BY data
    `;
  } else if (agruparPor === "semana") {
    atividadesAoLongo = await prisma.$queryRaw`
      SELECT DATE_TRUNC('week', "criadoEm") as data, COUNT(*) as total
      FROM "Atividade"
      WHERE ${Object.keys(filtro).length > 0 ? prisma.sql(JSON.stringify(filtro)) : prisma.sql(`1=1`)}
      GROUP BY DATE_TRUNC('week', "criadoEm")
      ORDER BY data
    `;
  } else if (agruparPor === "mes") {
    atividadesAoLongo = await prisma.$queryRaw`
      SELECT DATE_TRUNC('month', "criadoEm") as data, COUNT(*) as total
      FROM "Atividade"
      WHERE ${Object.keys(filtro).length > 0 ? prisma.sql(JSON.stringify(filtro)) : prisma.sql(`1=1`)}
      GROUP BY DATE_TRUNC('month', "criadoEm")
      ORDER BY data
    `;
  } else { // ano
    atividadesAoLongo = await prisma.$queryRaw`
      SELECT DATE_TRUNC('year', "criadoEm") as data, COUNT(*) as total
      FROM "Atividade"
      WHERE ${Object.keys(filtro).length > 0 ? prisma.sql(JSON.stringify(filtro)) : prisma.sql(`1=1`)}
      GROUP BY DATE_TRUNC('year', "criadoEm")
      ORDER BY data
    `;
  }

  // Contagem por usuário e tipo (para usuários mais ativos)
  const atividadesPorUsuario = await prisma.atividade.groupBy({
    by: ["usuarioId"],
    where: filtro,
    _count: true,
    orderBy: {
      _count: {
        desc: true,
      },
    },
    take: 10,
  });

  // Busca detalhes dos usuários para incluir nomes
  const usuariosAtivos = await prisma.usuario.findMany({
    where: {
      id: {
        in: atividadesPorUsuario.map(item => item.usuarioId),
      },
    },
    select: {
      id: true,
      nome: true,
      cargo: true,
    },
  });

  return {
    total: totalAtividades,
    porTipo: contagemPorTipo.map(item => ({
      tipo: item.tipo,
      total: item._count,
    })),
    aoLongoDoPeriodo: atividadesAoLongo,
    usuariosMaisAtivos: atividadesPorUsuario.map(item => ({
      usuarioId: item.usuarioId,
      nome: usuariosAtivos.find(usuario => usuario.id === item.usuarioId)?.nome || "Desconhecido",
      cargo: usuariosAtivos.find(usuario => usuario.id === item.usuarioId)?.cargo || "Desconhecido",
      totalAtividades: item._count,
    })),
  };
}