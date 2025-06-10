// src/app/api/usuarios/[id]/alterar-senha/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarAutenticacao, tratarErro } from "../../../utils";
import { alterarSenhaSchema } from "../../schema";
import { compare, hash } from "bcrypt";

/**
 * POST - Altera a senha de um usuário específico
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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

    // Verifica se o usuário tem permissão para alterar esta senha
    // (apenas o próprio usuário ou um Gerente pode alterar)
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
    });

    if (!usuario) {
      return NextResponse.json(
        { erro: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Extrai os dados do corpo da requisição
    const body = await req.json();
    
    // Valida os dados com o esquema Zod
    const result = alterarSenhaSchema.safeParse(body);
    
    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }
    
    const { senhaAtual, novaSenha } = result.data;

    // Verifica se a senha atual está correta
    const senhaCorreta = await compare(senhaAtual, usuario.senha || "");
    
    if (!senhaCorreta) {
      return NextResponse.json(
        { erro: "Senha atual incorreta" },
        { status: 400 }
      );
    }
    
    // Criptografa a nova senha
    const senhaHash = await hash(novaSenha, 10);

    // Atualiza a senha no banco de dados
    await prisma.usuario.update({
      where: { id },
      data: { senha: senhaHash },
    });

    // Registra a ação no log de auditoria
    await prisma.log.create({
      data: {
        usuarioId: token.id as string,
        acao: "Edição",
        entidade: "Usuario",
        entidadeId: id,
        detalhes: { alteracaoSenha: true },
      },
    });

    return NextResponse.json({
      mensagem: "Senha alterada com sucesso",
    });
  } catch (error) {
    return tratarErro(error);
  }
}