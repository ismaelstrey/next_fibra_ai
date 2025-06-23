// src/app/api/usuarios/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao } from "../utils";
import { criarUsuarioSchema } from "./schema";
import { hash } from "bcrypt";

/**
 * GET - Lista todos os usuários com paginação e filtros
 */
export async function GET(req: NextRequest) {
  try {
    // Verifica se o usuário tem permissão (apenas Gerentes podem listar todos os usuários)
    const permissaoErro = await verificarPermissao(req, ["Gerente"]);
    if (permissaoErro) return permissaoErro;

    // Obtém parâmetros de consulta
    const { searchParams } = new URL(req.url);
    const pagina = parseInt(searchParams.get("pagina") || "1");
    const limite = parseInt(searchParams.get("limite") || "10");
    const busca = searchParams.get("busca") || "";
    const cargo = searchParams.get("cargo");

    // Calcula o offset para paginação
    const skip = (pagina - 1) * limite;

    // Constrói o filtro
    const where: any = {};

    // Adiciona filtro de busca por nome ou email
    if (busca) {
      where.OR = [
        { nome: { contains: busca } },
        { email: { contains: busca } },
      ];
    }

    // Adiciona filtro por cargo
    if (cargo) {
      where.cargo = cargo;
    }

    // Consulta os usuários com paginação e filtros
    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        select: {
          id: true,
          nome: true,
          email: true,
          cargo: true,
          imagem: true,
          criadoEm: true,
          atualizadoEm: true,
          _count: {
            select: {
              cidades: true,
              logs: true,
              comentarios: true,
            },
          },
        },
        skip,
        take: limite,
        orderBy: { nome: "asc" },
      }),
      prisma.usuario.count({ where }),
    ]);

    // Calcula metadados de paginação
    const totalPaginas = Math.ceil(total / limite);

    return NextResponse.json({
      usuarios,
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
 * POST - Cria um novo usuário
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica se o usuário tem permissão (apenas Gerentes podem criar usuários)
    const permissaoErro = await verificarPermissao(req, ["Gerente"]);
    if (permissaoErro) return permissaoErro;

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = criarUsuarioSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const { nome, email, senha, cargo, imagem } = result.data;

    // Verifica se o email já está em uso
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { erro: "Email já está em uso" },
        { status: 409 }
      );
    }

    // Criptografa a senha
    const senhaHash = await hash(senha, 10);

    // Cria o usuário no banco de dados
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        cargo,
        imagem,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        imagem: true,
        criadoEm: true,
        atualizadoEm: true,
      },
    });
    const permicao = await verificarPermissao(req)
    console.log(permicao)
    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);

    if (token) {
      await prisma.log.create({
        data: {
          usuarioId: token?.id,
          acao: "Criação",
          entidade: "Usuario",
          entidadeId: novoUsuario.id,
          detalhes: { nome, email, cargo },
        },
      });
    }

    // Retorna os dados do usuário criado (sem a senha)
    return NextResponse.json(
      { mensagem: "Usuário criado com sucesso", usuario: novoUsuario },
      { status: 201 }
    );
  } catch (error) {
    return tratarErro(error);
  }
}