// src/app/api/registro/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcrypt";
import { prisma } from "@/prisma/prisma";

/**
 * Esquema de validação para o registro de usuário
 */
const registroSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmarSenha: z.string(),
}).refine(data => data.senha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

/**
 * Manipulador da rota POST para registro de usuário
 * @param req - Requisição Next.js
 * @returns Resposta Next.js
 */
export async function POST(req: NextRequest) {
  console.log(req)
  try {
    // Extrai os dados do corpo da requisição
    const body = await req.json();
    
    // Valida os dados com o esquema Zod
    const result = registroSchema.safeParse(body);
    
    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }
    
    const { nome, email, senha } = result.data;

    console.log(result.data)
    
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
        cargo: "Técnico", // Cargo padrão para novos usuários
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        criadoEm: true,
      },
    });

    console.log(novoUsuario)
    
    // Retorna os dados do usuário criado (sem a senha)
    return NextResponse.json(
      { mensagem: "Usuário registrado com sucesso", usuario: novoUsuario },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return NextResponse.json(
      { erro: "Erro ao processar o registro" },
      { status: 500 }
    );
  }
}