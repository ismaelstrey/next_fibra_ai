// src/app/api/clientes/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../utils";
import { clienteSchema } from "./schema";
import bcrypt from "bcrypt";

/**
 * GET - Lista todos os clientes com paginação e filtros
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
    const neutraId = searchParams.get("neutraId");
    const portaId = searchParams.get("portaId");
    const ctoId = searchParams.get("ctoId");

    // Calcula o offset para paginação
    const skip = (pagina - 1) * limite;

    // Constrói o filtro
    const where: any = {};

    // Adiciona filtro de busca por nome ou email
    if (busca) {
      where.OR = [
        { nome: { contains: busca, mode: "insensitive" } },
        { email: { contains: busca, mode: "insensitive" } },
        { telefone: { contains: busca, mode: "insensitive" } },
        { endereco: { contains: busca, mode: "insensitive" } },
      ];
    }

    // Adiciona filtro por neutra
    if (neutraId) {
      where.neutraId = neutraId;
    }

    // Adiciona filtro por porta
    if (portaId) {
      where.portaId = portaId;
    }

    // Adiciona filtro por CTO
    if (ctoId) {
      where.porta = {
        caixaId: ctoId
      };
    }

    // Consulta os clientes com paginação e filtros
    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          apartamento: true,
          endereco: true,
          casa: true,
          numero: true,
          potencia: true,
          wifi: true,
          senhaWifi: true,
          neutraId: true,
          portaId: true,
          neutra: {
            select: {
              id: true,
              nome: true,
              vlan: true,
            },
          },
          porta: {
            select: {
              id: true,
              numero: true,
              status: true,
              caixa: {
                select: {
                  id: true,
                  nome: true,
                  tipo: true,
                },
              },
            },
          },
        },
        skip,
        take: limite,
        orderBy: { nome: "asc" },
      }),
      prisma.cliente.count({ where }),
    ]);

    // Calcula metadados de paginação
    const totalPaginas = Math.ceil(total / limite);

    return NextResponse.json({
      clientes,
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
 * POST - Cria um novo cliente
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem criar clientes)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    // Extrai os dados do corpo da requisição
    const body = await req.json();
    console.log(body)


    // Valida os dados com o esquema Zod
    const result = clienteSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const {
      nome,
      email,
      senha,
      telefone,
      apartamento,
      endereco,
      casa,
      numero,
      potencia,
      wifi,
      senhaWifi,
      neutraId,
      portaId,
      status,
    } = result.data;

    // Verifica se o email já está em uso
    const clienteExistente = await prisma.cliente.findUnique({
      where: { email },
    });

    if (clienteExistente) {
      return NextResponse.json(
        { erro: "Email já está em uso" },
        { status: 400 }
      );
    }

    // Verifica se a neutra existe

    if (neutraId) {
      const neutra = await prisma.neutra.findUnique({
        where: { id: neutraId },
      });

      if (!neutra) {
        return NextResponse.json(
          { erro: "Neutra não encontrada" },
          { status: 404 }
        );
      }
    }

    console.log("olá")

    if (portaId) {
      const porta = await prisma.porta.findUnique({
        where: { id: portaId },
      });

      if (!porta) {
        return NextResponse.json(
          { erro: "Porta não encontrada" },
          { status: 404 }
        );
      }
      // Verifica se a porta existe

      console.log(porta)
      // Verifica se a porta está livre
      if (porta.status !== "Disponível") {
        return NextResponse.json(
          { erro: "A porta selecionada não está livre" },
          { status: 400 }
        );
      }
    }



    // Hash da senha, se fornecida
    let senhaHash = undefined;
    if (senha) {
      senhaHash = await bcrypt.hash(senha, 10);
    }

    // Cria o cliente no banco de dados
    const novoCliente = await prisma.$transaction(async (prisma) => {
      // Atualiza o status da porta para "Em uso"
      if (portaId) {
        await prisma.porta.update({
          where: { id: portaId },
          data: { status: "Em uso" },
        });
      }
      await prisma.porta.update({
        where: {
          id: portaId || '',

        },
        data: {
          status: status || "Em uso"
        }
      })

      // Cria o cliente
      return prisma.cliente.create({
        data: {
          nome,
          email,
          senha: senhaHash,
          telefone,
          apartamento,
          endereco,
          casa,
          numero,
          potencia,
          wifi,
          senhaWifi,
          neutraId: neutraId || null,
          portaId: portaId || null,

        },
      });
    });

    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Criação",
        entidade: "Cliente",
        entidadeId: novoCliente.id,
        detalhes: { nome, email, neutraId, portaId },
      });
    }

    // Retorna os dados do cliente criado (sem a senha)
    const { senha: _, ...clienteSemSenha } = novoCliente;
    return NextResponse.json(
      { mensagem: "Cliente criado com sucesso", cliente: clienteSemSenha },
      { status: 201 }
    );
  } catch (error) {
    return tratarErro(error);
  }
}