// src/app/api/usuarios/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao } from "../../utils";
import { atualizarUsuarioSchema } from "../schema";
import { compare, hash } from "bcrypt";

/**
 * GET - Obtém um usuário específico pelo ID
 */
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const token = await verificarAutenticacao(req);

    // Verifica se o usuário está autenticado
    if (!token) {
      return NextResponse.json(
        { erro: "Não autorizado" },
        { status: 401 }
      );
    }

    // Verifica se o usuário tem permissão para ver este perfil
    // (apenas o próprio usuário ou um Gerente pode ver)
    const ehProprioUsuario = token.id === id;
    const ehGerente = token.cargo === "Gerente";

    if (!ehProprioUsuario && !ehGerente) {
      return NextResponse.json(
        { erro: "Acesso negado" },
        { status: 403 }
      );
    }

    // Busca o usuário no banco de dados
    const usuario = await prisma.usuario.findUnique({
      where: { id },
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
        // Inclui as cidades apenas para gerentes ou para o próprio usuário
        cidades: ehGerente || ehProprioUsuario ? {
          select: {
            id: true,
            nome: true,
            estado: true,
          },
        } : undefined,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { erro: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario);
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PATCH - Atualiza um usuário específico pelo ID
 */
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const token = await verificarAutenticacao(req);

    // Verifica se o usuário está autenticado
    if (!token) {
      return NextResponse.json(
        { erro: "Não autorizado" },
        { status: 401 }
      );
    }

    // Verifica se o usuário tem permissão para editar este perfil
    // (apenas o próprio usuário ou um Gerente pode editar)
    const ehProprioUsuario = token.id === id;
    const ehGerente = token.cargo === "Gerente";

    if (!ehProprioUsuario && !ehGerente) {
      return NextResponse.json(
        { erro: "Acesso negado" },
        { status: 403 }
      );
    }

    // Busca o usuário no banco de dados
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuarioExistente) {
      return NextResponse.json(
        { erro: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Extrai os dados do corpo da requisição
    const body = await req.json();
    
    // Valida os dados com o esquema Zod
    const result = atualizarUsuarioSchema.safeParse(body);
    
    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }
    
    const { nome, email, cargo, imagem, senha, senhaAtual } = result.data;

    // Verifica se o email já está em uso por outro usuário
    if (email && email !== usuarioExistente.email) {
      const emailEmUso = await prisma.usuario.findUnique({
        where: { email },
      });
      
      if (emailEmUso) {
        return NextResponse.json(
          { erro: "Email já está em uso" },
          { status: 409 }
        );
      }
    }

    // Prepara os dados para atualização
    const dadosAtualizacao: any = {};
    
    if (nome) dadosAtualizacao.nome = nome;
    if (email) dadosAtualizacao.email = email;
    if (imagem !== undefined) dadosAtualizacao.imagem = imagem;
    
    // Apenas gerentes podem alterar o cargo de outros usuários
    if (cargo && (ehGerente || (ehProprioUsuario && token.cargo === "Gerente"))) {
      dadosAtualizacao.cargo = cargo;
    }

    // Se estiver alterando a senha, verifica a senha atual
    if (senha && senhaAtual) {
      // Verifica se a senha atual está correta
      const senhaCorreta = await compare(senhaAtual, usuarioExistente.senha || "");
      
      if (!senhaCorreta) {
        return NextResponse.json(
          { erro: "Senha atual incorreta" },
          { status: 400 }
        );
      }
      
      // Criptografa a nova senha
      dadosAtualizacao.senha = await hash(senha, 10);
    }

    // Atualiza o usuário no banco de dados
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id },
      data: dadosAtualizacao,
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

    // Registra a ação no log de auditoria
    await prisma.log.create({
      data: {
        usuarioId: token.id as string,
        acao: "Edição",
        entidade: "Usuario",
        entidadeId: id,
        detalhes: dadosAtualizacao,
      },
    });

    return NextResponse.json({
      mensagem: "Usuário atualizado com sucesso",
      usuario: usuarioAtualizado,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * DELETE - Remove um usuário específico pelo ID
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    
    // Verifica se o usuário tem permissão (apenas Gerentes podem excluir usuários)
    const permissaoErro = await verificarPermissao(req, ["Gerente"]);
    if (permissaoErro) return permissaoErro;

    // Busca o usuário no banco de dados
    const usuario = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      return NextResponse.json(
        { erro: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Remove o usuário do banco de dados
    await prisma.usuario.delete({
      where: { id },
    });

    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);
    if (token) {
      await prisma.log.create({
        data: {
          usuarioId: token.id as string,
          acao: "Exclusão",
          entidade: "Usuario",
          entidadeId: id,
          detalhes: { nome: usuario.nome, email: usuario.email },
        },
      });
    }

    return NextResponse.json({
      mensagem: "Usuário removido com sucesso",
    });
  } catch (error) {
    return tratarErro(error);
  }
}