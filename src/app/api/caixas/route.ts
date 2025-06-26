// src/app/api/caixas/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../utils";
import { caixaSchema } from "./schema";

/**
 * Função para implementar a divisão de rota quando uma nova caixa é adicionada
 */
async function implementarDivisaoRota(rotaOriginal: any, novaCaixa: any, coordenadasNovaCaixa: any) {
  // Calcula onde inserir a nova caixa baseado na distância
  const coordenadasRota = rotaOriginal.coordenadas as any[];
  let melhorPosicao = 0;
  let menorDistancia = Infinity;

  // Encontra o ponto mais próximo na rota para inserir a caixa
  for (let i = 0; i < coordenadasRota.length - 1; i++) {
    const distancia = calcularDistanciaParaSegmento(
      coordenadasNovaCaixa,
      coordenadasRota[i],
      coordenadasRota[i + 1]
    );
    if (distancia < menorDistancia) {
      menorDistancia = distancia;
      melhorPosicao = i + 1;
    }
  }

  // Divide as coordenadas da rota
  const coordenadas1 = coordenadasRota.slice(0, melhorPosicao);
  coordenadas1.push(coordenadasNovaCaixa);

  const coordenadas2 = [coordenadasNovaCaixa];
  coordenadas2.push(...coordenadasRota.slice(melhorPosicao));

  // Calcula a distribuição de capilares
  const totalCapilares = rotaOriginal.capilares.length;
  const distancia1 = calcularDistanciaTotal(coordenadas1);
  const distancia2 = calcularDistanciaTotal(coordenadas2);
  const distanciaTotal = distancia1 + distancia2;

  const proporcao1 = distancia1 / distanciaTotal;
  const capilares1 = Math.max(1, Math.floor(totalCapilares * proporcao1));
  const capilares2 = totalCapilares - capilares1;

  // Mapeia a quantidade de capilares para os tipos válidos
  const mapearTipoCabo = (quantidade: number): '6' | '12' | '24' | '48' | '96' => {
    if (quantidade <= 6) return '6';
    if (quantidade <= 12) return '12';
    if (quantidade <= 24) return '24';
    if (quantidade <= 48) return '48';
    return '96';
  };

  // Cria as duas novas rotas
  const rota1 = await prisma.rota.create({
    data: {
      nome: `${rotaOriginal.nome} - Parte 1`,
      tipoCabo: mapearTipoCabo(capilares1),
      fabricante: rotaOriginal.fabricante,
      status: rotaOriginal.status,
      distancia: distancia1,
      profundidade: rotaOriginal.profundidade,
      tipoPassagem: rotaOriginal.tipoPassagem,
      coordenadas: coordenadas1,
      cor: rotaOriginal.cor,
      observacoes: `Rota dividida - Primeira parte (${capilares1} capilares)`,
      cidadeId: rotaOriginal.cidadeId
    }
  });

  const rota2 = await prisma.rota.create({
    data: {
      nome: `${rotaOriginal.nome} - Parte 2`,
      tipoCabo: mapearTipoCabo(capilares2),
      fabricante: rotaOriginal.fabricante,
      status: rotaOriginal.status,
      distancia: distancia2,
      profundidade: rotaOriginal.profundidade,
      tipoPassagem: rotaOriginal.tipoPassagem,
      coordenadas: coordenadas2,
      cor: rotaOriginal.cor,
      observacoes: `Rota dividida - Segunda parte (${capilares2} capilares)`,
      cidadeId: rotaOriginal.cidadeId
    }
  });

  // Redistribui os capilares existentes entre as duas novas rotas
  const capilaresExistentes = rotaOriginal.capilares;
  const capilaresParaRota1 = capilaresExistentes.slice(0, capilares1);
  const capilaresParaRota2 = capilaresExistentes.slice(capilares1);

  // Cria capilares para a rota 1
  for (const capilar of capilaresParaRota1) {
    await prisma.capilar.create({
      data: {
        numero: capilar.numero,
        tipo: capilar.tipo,
        comprimento: capilar.comprimento,
        status: capilar.status,
        potencia: capilar.potencia,
        cidadeId: capilar.cidadeId,
        rota: {
          connect: { id: rota1.id }
        }
      }
    });
  }

  // Cria capilares para a rota 2
  for (const capilar of capilaresParaRota2) {
    await prisma.capilar.create({
      data: {
        numero: capilar.numero,
        tipo: capilar.tipo,
        comprimento: capilar.comprimento,
        status: capilar.status,
        potencia: capilar.potencia,
        cidadeId: capilar.cidadeId,
        rota: {
          connect: { id: rota2.id }
        }
      }
    });
  }

  // PRIMEIRO: Salva as informações das caixas existentes antes de remover as relações
  // Exclui a nova caixa da lista de caixas existentes para evitar duplicação
  const caixasExistentes = rotaOriginal.rotaCaixas.filter((rc: any) => rc.caixaId !== novaCaixa.id);

  // SEGUNDO: Remove todas as relações da rota original
  await prisma.rotaCaixa.deleteMany({
    where: { rotaId: rotaOriginal.id }
  });

  // TERCEIRO: Cria as novas relações para as caixas existentes
  for (const rotaCaixa of caixasExistentes) {
    const caixaCoordenadas = rotaCaixa.caixa.coordenadas as any;
    const distanciaPara1 = calcularDistanciaEntrePontos(caixaCoordenadas, coordenadas1[coordenadas1.length - 1]);
    const distanciaPara2 = calcularDistanciaEntrePontos(caixaCoordenadas, coordenadas2[0]);

    const rotaDestino = distanciaPara1 < distanciaPara2 ? rota1.id : rota2.id;

    await prisma.rotaCaixa.create({
      data: {
        rotaId: rotaDestino,
        caixaId: rotaCaixa.caixaId,
        tipoConexao: rotaCaixa.tipoConexao,
        ordem: rotaCaixa.ordem
      }
    });
  }

  // QUARTO: Adiciona a nova caixa como ponto de conexão entre as duas rotas
  await prisma.rotaCaixa.createMany({
    data: [
      {
        rotaId: rota1.id,
        caixaId: novaCaixa.id,
        tipoConexao: 'saida',
        ordem: 999
      },
      {
        rotaId: rota2.id,
        caixaId: novaCaixa.id,
        tipoConexao: 'entrada',
        ordem: 1
      }
    ]
  });

  // Remove os capilares associados à rota original
  await prisma.capilar.deleteMany({
    where: {
      rota: {
        some: {
          id: rotaOriginal.id
        }
      }
    }
  });



  // Remove as fusões associadas à rota original
  await prisma.fusao.deleteMany({
    where: {
      rotaOrigemId: rotaOriginal.id
    }
  });

  // Remove as manutenções associadas à rota original
  await prisma.manutencao.deleteMany({
    where: {
      rotaId: rotaOriginal.id
    }
  });


  const deleted = await prisma.rota.delete({

    where: { id: rotaOriginal.id }
  });
  if (deleted) {
    console.log('Rota original deletada com sucesso');
  } else {
    console.log('Erro ao deletar rota original');
  }

  return { rota1, rota2 };
}

/**
 * Calcula a distância de um ponto para um segmento de linha
 */
function calcularDistanciaParaSegmento(ponto: any, inicio: any, fim: any): number {
  const A = ponto.lat - inicio.lat;
  const B = ponto.lng - inicio.lng;
  const C = fim.lat - inicio.lat;
  const D = fim.lng - inicio.lng;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy;
  if (param < 0) {
    xx = inicio.lat;
    yy = inicio.lng;
  } else if (param > 1) {
    xx = fim.lat;
    yy = fim.lng;
  } else {
    xx = inicio.lat + param * C;
    yy = inicio.lng + param * D;
  }

  const dx = ponto.lat - xx;
  const dy = ponto.lng - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calcula a distância total de uma rota
 */
function calcularDistanciaTotal(coordenadas: any[]): number {
  let distancia = 0;
  for (let i = 0; i < coordenadas.length - 1; i++) {
    distancia += calcularDistanciaEntrePontos(coordenadas[i], coordenadas[i + 1]);
  }
  return distancia;
}

/**
 * Calcula a distância entre dois pontos
 */
function calcularDistanciaEntrePontos(ponto1: any, ponto2: any): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (ponto2.lat - ponto1.lat) * Math.PI / 180;
  const dLng = (ponto2.lng - ponto1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(ponto1.lat * Math.PI / 180) * Math.cos(ponto2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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
      };
      rotaCaixas?: {
        some: {
          rotaId: string;
        };
      };
    }

    // Constrói o filtro
    const where: Busca = { nome: undefined, cidadeId: undefined, rotaId: undefined, tipo: undefined };

    // Adiciona filtro de busca por nome
    if (busca) {
      where.nome = busca
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

    // Adiciona filtro por rota (agora usando RotaCaixa)
    if (rotaId) {
      where.rotaCaixas = {
        some: {
          rotaId: rotaId
        }
      };
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
          spliters: true,
          cidade: {
            select: {
              nome: true,
              estado: true,
            },
          },

          rotaCaixas: {
            select: {
              tipoConexao: true,
              ordem: true,
              rota: {
                select: {
                  id: true,
                  nome: true,
                  tipoCabo: true,
                },
              },
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
          }
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

    // Se rotaId foi fornecido, verifica se a rota existe
    let rota = null;
    if (rotaId) {
      rota = await prisma.rota.findUnique({
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
      },
    });

    // Se uma rota foi especificada, conecta a caixa à rota
    if (rotaId && rota) {
      // Verifica se a caixa está sendo adicionada no meio de uma rota existente
      const rotaOriginal = await prisma.rota.findUnique({
        where: { id: rotaId },
        include: {
          rotaCaixas: {
            include: {
              caixa: true
            },
            orderBy: { ordem: 'asc' }
          },
          capilares: true
        }
      });

      if (rotaOriginal) {
        // Se a rota já tem caixas, implementa a lógica de divisão
        if (rotaOriginal.rotaCaixas.length > 0) {
          await implementarDivisaoRota(rotaOriginal, novaCaixa, coordenadas);
        } else {
          // Se é a primeira caixa da rota, apenas cria a relação
          await implementarDivisaoRota(rotaOriginal, novaCaixa, coordenadas);
          // await prisma.rotaCaixa.create({
          //   data: {
          //     rotaId,
          //     caixaId: novaCaixa.id,
          //     tipoConexao: 'entrada',
          //     ordem: 1
          //   }
          // });

        }
      }
    }

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