// src/app/api/fusoes/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { tratarErro } from "@/utils/erros";
import { registrarLog } from "@/utils/logs";
import { verificarPermissao } from "@/utils/permissoes";
import { extrairTokenJWT } from "@/middlewares/auth";
import { fusaoSchema, criarFusoesEmLoteSchema } from "./schema";

/**
 * @swagger
 * components:
 *   schemas:
 *     Fusao:
 *       type: object
 *       required:
 *         - capilarOrigemId
 *         - capilarDestinoId
 *         - tipoFusao
 *         - status
 *         - caixaId
 *       properties:
 *         id:
 *           type: string
 *           description: ID único da fusão
 *         capilarOrigemId:
 *           type: string
 *           description: ID do capilar de origem
 *         capilarDestinoId:
 *           type: string
 *           description: ID do capilar de destino
 *         tipoFusao:
 *           type: string
 *           enum: [capilar_capilar, capilar_splitter, splitter_cliente]
 *           description: Tipo da fusão
 *         status:
 *           type: string
 *           enum: [Ativa, Inativa, Manutencao]
 *           description: Status atual da fusão
 *         qualidadeSinal:
 *           type: number
 *           description: Qualidade do sinal (opcional)
 *         perdaInsercao:
 *           type: number
 *           description: Perda de inserção (opcional)
 *         cor:
 *           type: string
 *           description: Cor da fusão (opcional)
 *         observacoes:
 *           type: string
 *           description: Observações sobre a fusão (opcional)
 *         caixaId:
 *           type: string
 *           description: ID da caixa onde a fusão está localizada
 *         bandejaId:
 *           type: string
 *           description: ID da bandeja onde a fusão está localizada (opcional)
 *         posicaoFusao:
 *           type: integer
 *           description: Posição da fusão na bandeja (opcional)
 *         criadoPorId:
 *           type: string
 *           description: ID do usuário que criou a fusão (opcional)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 */

/**
 * @swagger
 * /api/fusoes:
 *   get:
 *     summary: Lista todas as fusões
 *     description: Retorna uma lista de todas as fusões com opções de filtragem
 *     tags: [Fusões]
 *     parameters:
 *       - in: query
 *         name: caixaId
 *         schema:
 *           type: string
 *         description: Filtrar por ID da caixa
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por status da fusão
 *       - in: query
 *         name: tipoFusao
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de fusão
 *     responses:
 *       200:
 *         description: Lista de fusões
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Fusao'
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 *
 *   post:
 *     summary: Cria uma nova fusão
 *     description: Cria uma nova fusão com os dados fornecidos
 *     tags: [Fusões]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Fusao'
 *     responses:
 *       201:
 *         description: Fusão criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fusao'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /api/fusoes/{id}:
 *   get:
 *     summary: Obtém uma fusão específica
 *     description: Retorna os detalhes de uma fusão específica pelo ID
 *     tags: [Fusões]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da fusão
 *     responses:
 *       200:
 *         description: Detalhes da fusão
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fusao'
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Fusão não encontrada
 *       500:
 *         description: Erro interno do servidor
 *
 *   put:
 *     summary: Atualiza uma fusão
 *     description: Atualiza os dados de uma fusão existente
 *     tags: [Fusões]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da fusão
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Fusao'
 *     responses:
 *       200:
 *         description: Fusão atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fusao'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Fusão não encontrada
 *       500:
 *         description: Erro interno do servidor
 *
 *   delete:
 *     summary: Remove uma fusão
 *     description: Remove uma fusão existente pelo ID
 *     tags: [Fusões]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da fusão
 *     responses:
 *       200:
 *         description: Fusão removida com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Fusão não encontrada
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * Função auxiliar para verificar se o usuário tem acesso à caixa
 */
async function verificarAcessoCaixa(req: NextRequest, caixaId: string) {
  // Extrai o token do cabeçalho de autorização
  const authHeader = req.headers.get("authorization");
  const usuario = await extrairTokenJWT(authHeader);
  
  if (!usuario) {
    return { erro: NextResponse.json({ mensagem: "Não autorizado" }, { status: 401 }) };
  }

  // Busca os dados da caixa primeiro
  const caixa = await prisma.caixa.findUnique({
    where: { id: caixaId },
    select: {
      cidadeId: true,
      tipo: true,
      cidade: {
        select: {
          id: true,
          nome: true,
        },
      },
    },
  });

  if (!caixa) {
    return { erro: NextResponse.json({ mensagem: "Caixa não encontrada" }, { status: 404 }) };
  }

  // Gerentes têm acesso a todas as caixas
  if (usuario.cargo === "Gerente") {
    return { temAcesso: true, usuario, caixa };
  }

  // Verifica se o usuário tem acesso à cidade da caixa
  const temAcessoCidade = usuario.cidadesIds?.includes(caixa.cidadeId);
  if (!temAcessoCidade) {
    await registrarLog(
      usuario,
      "caixas",
      "consultar",
      `Tentativa de acesso não autorizado à caixa ${caixaId} na cidade ${caixa.cidade.nome}`,
      caixaId
    );
    return { erro: NextResponse.json({ mensagem: "Você não tem acesso a esta caixa" }, { status: 403 }) };
  }

  return { temAcesso: true, usuario, caixa };
}

/**
 * GET - Lista todas as fusões com paginação e filtros
 */
export async function GET(req: NextRequest) {
  try {
    // Verifica permissão para listar fusões
    const { autorizado, usuario, mensagem } = await verificarPermissao(req, "fusoes", "ler");
    if (!autorizado) {
      return NextResponse.json({ mensagem }, { status: 401 });
    }

    // Obtém parâmetros de consulta
    const { searchParams } = new URL(req.url);
    const pagina = parseInt(searchParams.get("pagina") || "1");
    const limite = parseInt(searchParams.get("limite") || "100");
    const busca = searchParams.get("busca") || "";
    const cidadeId = searchParams.get("cidadeId");
    const caixaId = searchParams.get("caixaId");
    const bandejaId = searchParams.get("bandejaId");

    // Calcula o offset para paginação
    const skip = (pagina - 1) * limite;

    // Constrói o filtro
    const where: any = {};

    // Adiciona filtro de busca por capilares
    if (busca) {
      where.OR = [
        { 
          capilarOrigem: { 
            numero: { 
              equals: parseInt(busca) || undefined 
            } 
          } 
        },
        { 
          capilarDestino: { 
            numero: { 
              equals: parseInt(busca) || undefined 
            } 
          } 
        },
        { observacoes: { contains: busca } },
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
          capilarOrigemId: true,
          capilarDestinoId: true,
          tipoFusao: true,
          status: true,
          qualidadeSinal: true,
          perdaInsercao: true,
          cor: true,
          observacoes: true,
          posicaoFusao: true,
          criadoEm: true,
          atualizadoEm: true,
          caixaId: true,
          bandejaId: true,
          capilarOrigem: {
            select: {
              id: true,
              numero: true,
              tipo: true,
              status: true,
              tubo: {
                select: {
                  numero: true,
                  tipo: true,
                },
              },
            },
          },
          capilarDestino: {
            select: {
              id: true,
              numero: true,
              tipo: true,
              status: true,
              tubo: {
                select: {
                  numero: true,
                  tipo: true,
                },
              },
            },
          },
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
          criadoPor: {
            select: {
              id: true,
              nome: true,
              cargo: true,
            },
          },
        },
        skip,
        take: limite,
        orderBy: [
          { caixa: { nome: "asc" } },
          { bandeja: { numero: "asc" } },
          { capilarOrigem: { numero: "asc" } },
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

      // Verifica se todos os capilares existem
      const capilarIds = [...new Set([
        ...fusoes.map(f => f.capilarOrigemId),
        ...fusoes.map(f => f.capilarDestinoId)
      ])];

      // Filtrar apenas IDs que não são sintéticos (não começam com 'entrada-' ou 'saida-')
      const capilaresReais = capilarIds.filter(id => 
        !id.startsWith('entrada-') && !id.startsWith('saida-')
      );

      if (capilaresReais.length > 0) {
        const capilaresExistentes = await prisma.capilar.findMany({
          where: { id: { in: capilaresReais } },
          select: { id: true }
        });

        const capilaresEncontrados = capilaresExistentes.map(c => c.id);
        const capilaresNaoEncontrados = capilaresReais.filter(id => !capilaresEncontrados.includes(id));

        if (capilaresNaoEncontrados.length > 0) {
          return NextResponse.json(
            { 
              erro: "Alguns capilares não foram encontrados", 
              capilaresNaoEncontrados 
            },
            { status: 404 }
          );
        }
      }

      // Verifica se o usuário tem acesso à caixa
      const acesso = await verificarAcessoCaixa(req, caixaId);
      if (acesso.erro) return acesso.erro;

      // Verifica se a caixa é do tipo CEO ou CTO
      if (acesso.caixa?.tipo !== "CEO" && acesso.caixa?.tipo !== "CTO") {
        return NextResponse.json(
          { erro: "Só é possível registrar fusões em caixas do tipo CEO ou CTO" },
          { status: 400 }
        );
      }



      // Verifica se a caixa é do tipo CTO e se foram especificadas bandejas
      if (acesso.caixa?.tipo === "CTO" && fusoes.some(f => f.bandejaId)) {
        return NextResponse.json(
          { erro: "Caixas do tipo CTO não possuem bandejas" },
          { status: 400 }
        );
      }

      // Verifica se as bandejas existem e pertencem à caixa (apenas para CEO)
      const bandejaIds = new Set(fusoes.filter(f => f.bandejaId).map(f => f.bandejaId));
      if (bandejaIds.size > 0) {
        const bandejas = await prisma.bandeja.findMany({
          where: {
            id: { in: Array.from(bandejaIds).filter((id): id is string => id !== undefined) },
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

      // Processar fusões uma por uma para lidar com IDs sintéticos
      const novasFusoes = [];
      for (const fusaoData of fusoes) {
        let capilarOrigemIdFinal = fusaoData.capilarOrigemId;
        let capilarDestinoIdFinal = fusaoData.capilarDestinoId;
        
        // Verificar se são IDs sintéticos
        const isOrigemSintetico = fusaoData.capilarOrigemId.startsWith('entrada-') || fusaoData.capilarOrigemId.startsWith('saida-');
        const isDestinoSintetico = fusaoData.capilarDestinoId.startsWith('entrada-') || fusaoData.capilarDestinoId.startsWith('saida-');
        
        // Criar capilares virtuais se necessário
        if (isOrigemSintetico) {
          const capilarVirtual = await prisma.capilar.create({
            data: {
              numero: 0,
              tipo: fusaoData.capilarOrigemId.startsWith('entrada-') ? 'virtual_splitter_entrada' : 'virtual_splitter_saida',
              comprimento: 0,
              status: 'Ativo',
              potencia: 0,
              cidadeId: acesso.caixa?.cidadeId || null,
            }
          });
          capilarOrigemIdFinal = capilarVirtual.id;
        }
        
        if (isDestinoSintetico) {
          const capilarVirtual = await prisma.capilar.create({
            data: {
              numero: 0,
              tipo: fusaoData.capilarDestinoId.startsWith('entrada-') ? 'virtual_splitter_entrada' : 'virtual_splitter_saida',
              comprimento: 0,
              status: 'Ativo',
              potencia: 0,
              cidadeId: acesso.caixa?.cidadeId || null,
            }
          });
          capilarDestinoIdFinal = capilarVirtual.id;
        }
        
        // Criar a fusão individual
        const novaFusao = await prisma.fusao.create({
          data: {
            ...fusaoData,
            capilarOrigemId: capilarOrigemIdFinal,
            capilarDestinoId: capilarDestinoIdFinal,
            observacoes: `${fusaoData.observacoes || ''} [IDs originais: ${fusaoData.capilarOrigemId} -> ${fusaoData.capilarDestinoId}]`,
            criadoPorId: acesso.token.id as string,
          }
        });
        
        novasFusoes.push(novaFusao);
      }

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
        { mensagem: `${novasFusoes.length} fusões criadas com sucesso` },
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
        capilarOrigemId,
        capilarDestinoId,
        tipoFusao,
        status,
        qualidadeSinal,
        perdaInsercao,
        cor,
        observacoes,
        caixaId,
        bandejaId,
        posicaoFusao
      } = result.data;

      // Verifica se o usuário tem acesso à caixa
      const acesso = await verificarAcessoCaixa(req, caixaId);
      if (acesso.erro) return acesso.erro;

      // Verifica se a caixa é do tipo CEO ou CTO
      if (acesso.caixa?.tipo !== "CEO" && acesso.caixa?.tipo !== "CTO") {
        return NextResponse.json(
          { erro: "Só é possível registrar fusões em caixas do tipo CEO ou CTO" },
          { status: 400 }
        );
      }

      // Verifica se os capilares existem
      // IDs que começam com 'entrada-' ou 'saida-' são IDs sintéticos de splitters
      const isCapilarOrigemSintetico = capilarOrigemId.startsWith('entrada-') || capilarOrigemId.startsWith('saida-');
      const isCapilarDestinoSintetico = capilarDestinoId.startsWith('entrada-') || capilarDestinoId.startsWith('saida-');
      
      if (!isCapilarOrigemSintetico) {
        const capilarOrigem = await prisma.capilar.findUnique({
          where: { id: capilarOrigemId },
          select: { id: true, numero: true, status: true }
        });

        if (!capilarOrigem) {
          return NextResponse.json(
            { erro: "Capilar de origem não encontrado", capilarId: capilarOrigemId },
            { status: 404 }
          );
        }
      }

      if (!isCapilarDestinoSintetico) {
        const capilarDestino = await prisma.capilar.findUnique({
          where: { id: capilarDestinoId },
          select: { id: true, numero: true, status: true }
        });

        if (!capilarDestino) {
          return NextResponse.json(
            { erro: "Capilar de destino não encontrado", capilarId: capilarDestinoId },
            { status: 404 }
          );
        }
      }

      // Verifica se a caixa é do tipo CTO e se foi especificada uma bandeja
      if (acesso.caixa?.tipo === "CTO" && bandejaId) {
        return NextResponse.json(
          { erro: "Caixas do tipo CTO não possuem bandejas" },
          { status: 400 }
        );
      }

      // Se foi especificada uma bandeja (apenas para CEO), verifica se ela existe e pertence à caixa
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

      // Para IDs sintéticos, precisamos criar capilares virtuais temporariamente
      // ou usar uma abordagem diferente para armazenar essas fusões
      let capilarOrigemIdFinal = capilarOrigemId;
      let capilarDestinoIdFinal = capilarDestinoId;
      
      // Se for ID sintético de entrada de splitter, criar um capilar virtual
      if (isCapilarOrigemSintetico) {
        const capilarVirtual = await prisma.capilar.create({
          data: {
            numero: 0, // Número especial para capilares virtuais
            tipo: 'virtual_splitter_entrada',
            comprimento: 0,
            status: 'Ativo',
            potencia: 0,
            cidadeId: acesso.caixa?.cidadeId || null, // Usar a cidade da caixa se disponível
          }
        });
        capilarOrigemIdFinal = capilarVirtual.id;
      }
      
      if (isCapilarDestinoSintetico) {
        const capilarVirtual = await prisma.capilar.create({
          data: {
            numero: 0, // Número especial para capilares virtuais
            tipo: capilarDestinoId.startsWith('entrada-') ? 'virtual_splitter_entrada' : 'virtual_splitter_saida',
            comprimento: 0,
            status: 'Ativo',
            potencia: 0,
            cidadeId: acesso.caixa?.cidadeId || null, // Usar a cidade da caixa se disponível
          }
        });
        capilarDestinoIdFinal = capilarVirtual.id;
      }
console.log({capilarOrigemIdFinal,capilarDestinoIdFinal})

      // Cria a fusão no banco de dados
      const novaFusao = await prisma.fusao.create({
        data: {
          capilarOrigemId: capilarOrigemIdFinal,
          capilarDestinoId: capilarDestinoIdFinal,
          tipoFusao: result.data.tipoFusao,
          status,
          qualidadeSinal: result.data.qualidadeSinal,
          perdaInsercao: result.data.perdaInsercao,
          cor,
          observacoes: `${observacoes || ''} [IDs originais: ${capilarOrigemId} -> ${capilarDestinoId}]`,
          caixaId,
          bandejaId,
          posicaoFusao: result.data.posicaoFusao,
          criadoPorId: acesso.token.id as string,
        },
        include: {
          capilarOrigem: {
            select: {
              id: true,
              numero: true,
              tipo: true,
              status: true,
              tubo: {
                select: {
                  numero: true,
                  tipo: true,
                },
              },
            },
          },
          capilarDestino: {
            select: {
              id: true,
              numero: true,
              tipo: true,
              status: true,
              tubo: {
                select: {
                  numero: true,
                  tipo: true,
                },
              },
            },
          },
          caixa: {
            select: {
              nome: true,
              tipo: true,
            },
          },
          bandeja: {
            select: {
              numero: true,
              capacidade: true,
            },
          },
          criadoPor: {
            select: {
              id: true,
              nome: true,
              cargo: true,
            },
          },
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
          detalhes: { capilarOrigemId, capilarDestinoId, caixaId, bandejaId },
        });
      }

      // Serializa BigInt para string
      function replacerBigInt(key: string, value: any) {
        return typeof value === "bigint" ? value.toString() : value;
      }

      return new NextResponse(
        JSON.stringify({
          mensagem: "Fusão criada com sucesso",
          fusao: JSON.parse(JSON.stringify(novaFusao, replacerBigInt))
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    return tratarErro(error);
  }
}