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
  // Busca os tubos e capilares da rota original
  const rotaOriginalCompleta = await prisma.rota.findUnique({
    where: { id: rotaOriginal.id },
    include: {
      tubos: {
        include: {
          capilares: true
        }
      }
    }
  });
  // Calcula a quantidade total de capilares da rota original
  const totalCapilares = rotaOriginalCompleta?.tubos.reduce((acc, tubo) => acc + tubo.capilares.length, 0) ?? 0;
  const distancia1 = calcularDistanciaTotal(coordenadas1);
  const distancia2 = calcularDistanciaTotal(coordenadas2);






  // Cria as duas novas rotas
  const rota1 = await prisma.rota.create({
    data: {
      nome: `${rotaOriginal.nome}-Tipo ${totalCapilares} - Parte 1`,
      tipoCabo: totalCapilares.toString(),
      fabricante: rotaOriginal.fabricante,
      status: rotaOriginal.status,
      distancia: distancia1,
      profundidade: rotaOriginal.profundidade,
      tipoPassagem: rotaOriginal.tipoPassagem,
      coordenadas: coordenadas1,
      cor: rotaOriginal.cor,
      observacoes: `Rota dividida - Primeira parte (${totalCapilares} capilares)`,
      cidadeId: rotaOriginal.cidadeId
    }
  });
  console.log('Rota 1 criada:', rota1.id, rota1.nome);

  const rota2 = await prisma.rota.create({
    data: {
      nome: `${rotaOriginal.nome} -Tipo ${totalCapilares} - Parte 2`,
      tipoCabo: totalCapilares.toString(),
      fabricante: rotaOriginal.fabricante,
      status: rotaOriginal.status,
      distancia: distancia2,
      profundidade: rotaOriginal.profundidade,
      tipoPassagem: rotaOriginal.tipoPassagem,
      coordenadas: coordenadas2,
      cor: rotaOriginal.cor,
      observacoes: `Rota dividida - Segunda parte (${totalCapilares} capilares)`,
      cidadeId: rotaOriginal.cidadeId
    }
  });
  console.log('Rota 2 criada:', rota2.id, rota2.nome);

  // Cria tubos para cada nova rota
  // Criação dos tubos para cada nova rota
  // O campo 'numero' deve ser sequencial e 'quantidadeCapilares' igual ao número de capilares criados
  const tubo1 = await prisma.tubo.create({
    data: {
      numero: 1, // ou lógica para determinar o próximo número sequencial
      tipo: totalCapilares.toString(),

      quantidadeCapilares: totalCapilares,
      rotaId: rota1.id,
    },
  });
  const tubo2 = await prisma.tubo.create({
    data: {
      numero: 1, // ou lógica para determinar o próximo número sequencial
      tipo: totalCapilares.toString(),
      quantidadeCapilares: totalCapilares,
      rotaId: rota2.id,
    },
  });

  // Cria capilares para cada tubo
  for (let i = 1; i <= totalCapilares; i++) {
    await prisma.capilar.create({
      data: {
        numero: i,
        tipo: 'fibra',
        comprimento: distancia1,
        status: 'disponível',
        potencia: 0,
        tuboId: tubo1.id
      }
    });
  }
  for (let i = 1; i <= totalCapilares; i++) {
    await prisma.capilar.create({
      data: {
        numero: i,
        tipo: 'fibra',
        comprimento: distancia2,
        status: 'disponível',
        potencia: 0,
        tuboId: tubo2.id
      }
    });
  }
  console.log('Tubos e capilares criados para as novas rotas');

  // Associa a nova CTO às duas rotas criadas
  await prisma.rotaCaixa.create({
    data: {
      rotaId: rota1.id,
      caixaId: novaCaixa.id,
      tipoConexao: 'saida',
      ordem: 1
    }
  });

  await prisma.rotaCaixa.create({
    data: {
      rotaId: rota2.id,
      caixaId: novaCaixa.id,
      tipoConexao: 'entrada',
      ordem: 1
    }
  });
  console.log('CTO associada às novas rotas');

  // Remove associações da rota original com caixas
  await prisma.rotaCaixa.deleteMany({
    where: {
      rotaId: rotaOriginal.id
    }
  });

  // Remove os capilares associados à rota original (via tubo)
  await prisma.capilar.deleteMany({
    where: {
      tubo: { rotaId: rotaOriginal.id }
    }
  });
  // Remove tubos da rota original
  await prisma.tubo.deleteMany({
    where: { rotaId: rotaOriginal.id }
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
    console.log('Rota original deletada com sucesso:', deleted.id, deleted.nome);
  } else {
    console.log('Erro ao deletar rota original');
  }
  console.log('Divisão de rota finalizada para:', rotaOriginal.nome);

  // return { rota1, rota2 };
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
    const ctoId = searchParams.get("ctoId");

    // Calcula o offset para paginação
    const skip = (pagina - 1) * limite;

    interface Busca {
      nome?: string;
      cidadeId?: string;
      rotaId?: string;
      tipo?: string;
      ctoId?: string;
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
    const where: Busca = { nome: undefined, cidadeId: undefined, rotaId: undefined, tipo: undefined, ctoId: undefined };

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
    console.log(body)

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
      rotaIds
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

    // Valida rotas associadas
    let rotasValidas: { id: string }[] = [];
    if (rotaIds && Array.isArray(rotaIds) && rotaIds.length > 0) {
      rotasValidas = await prisma.rota.findMany({
        where: {
          id: { in: rotaIds },
          cidadeId: cidadeId
        }
      });
      if (rotasValidas.length !== rotaIds.length) {
        return NextResponse.json(
          { erro: "Uma ou mais rotas não encontradas ou não pertencem à cidade especificada" },
          { status: 404 }
        );
      }
    } else if (tipo === "CTO") {
      // Se for CTO e não tiver rotas especificadas, busca a rota mais próxima
      const todasRotas = await prisma.rota.findMany({
        where: {
          cidadeId: cidadeId
        }
      });

      if (todasRotas.length > 0) {
        let rotaMaisProxima = todasRotas[0];
        let menorDistancia = Infinity;

        for (const rota of todasRotas) {
          const coordenadasRota = rota.coordenadas as any[];
          for (let i = 0; i < coordenadasRota.length - 1; i++) {
            const distancia = calcularDistanciaParaSegmento(
              coordenadas,
              coordenadasRota[i],
              coordenadasRota[i + 1]
            );
            if (distancia < menorDistancia) {
              menorDistancia = distancia;
              rotaMaisProxima = rota;
            }
          }
        }

        rotasValidas = [{ id: rotaMaisProxima.id }];
        console.log(`Rota mais próxima encontrada: ${rotaMaisProxima.nome} (distância: ${menorDistancia})`);
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

    // Associa a caixa às rotas válidas e implementa divisão se for CTO
    if (rotasValidas.length > 0) {
      for (const rota of rotasValidas) {
        // Se for uma CTO, implementa a divisão da rota
        console.log(tipo)
        if (tipo === "CTO") {
          // Busca a rota completa com todos os dados necessários
          const rotaCompleta = await prisma.rota.findUnique({
            where: { id: rota.id },
            include: {
              tubos: {
                include: {
                  capilares: true
                }
              }
            }
          });
          console.log(rotaCompleta)
          if (rotaCompleta) {
            await implementarDivisaoRota(rotaCompleta, novaCaixa, coordenadas);
          }
        } else {
          // Para CEO, apenas associa normalmente
          await prisma.rotaCaixa.create({
            data: {
              rotaId: rota.id,
              caixaId: novaCaixa.id,
              tipoConexao: 'entrada',
              ordem: 1
            }
          });
        }
      }
    }

    // Se for uma CTO, cria automaticamente as portas
    if (tipo === "CTO") {
      const portas = Array.from({ length: capacidade }, (_, i) => ({
        numero: i + 1,
        status: "Disponível",
        caixaId: novaCaixa.id,
      }));
      await prisma.porta.createMany({ data: portas });
    }

    // Se for uma CEO, cria automaticamente as bandejas (assumindo 1 bandeja para cada 12 fibras)
    if (tipo === "CEO") {
      const numBandejas = Math.ceil(capacidade / 12);
      const bandejas = Array.from({ length: numBandejas }, (_, i) => ({
        numero: i + 1,
        capacidade: i === numBandejas - 1 && capacidade % 12 !== 0 ? capacidade % 12 : 12,
        caixaId: novaCaixa.id,
      }));
      await prisma.bandeja.createMany({ data: bandejas });
    }

    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Criação",
        entidade: "Caixa",
        entidadeId: novaCaixa.id,
        detalhes: { nome, tipo, cidadeId, rotaIds },
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