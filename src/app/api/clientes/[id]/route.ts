// src/app/api/clientes/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../../utils";
import { atualizarClienteSchema } from "../schema";
import bcrypt from "bcrypt";

/**
 * GET - Obtém um cliente específico por ID
 */
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário está autenticado
    const token = await verificarAutenticacao(req);
    if (!token) {
      return NextResponse.json(
        { erro: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Busca o cliente com todas as informações relacionadas
    const cliente = await prisma.cliente.findUnique({
      where: { id },
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
        caixaId: true,
        cidadeId: true,
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
                coordenadas: true,
                cidade: {
                  select: {
                    id: true,
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
              },
            },
          },
        },
      },
    });

    if (!cliente) {
      return NextResponse.json(
        { erro: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(cliente);
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PATCH - Atualiza um cliente específico por ID
 */
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem atualizar clientes)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se o cliente existe
    const clienteExistente = await prisma.cliente.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        portaId: true,
      },
    });

    if (!clienteExistente) {
      return NextResponse.json(
        { erro: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = atualizarClienteSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const dadosAtualizacao = result.data;

    // Se estiver alterando o email, verifica se já está em uso
    if (dadosAtualizacao.email && dadosAtualizacao.email !== clienteExistente.email) {
      const emailEmUso = await prisma.cliente.findUnique({
        where: { email: dadosAtualizacao.email },
      });

      if (emailEmUso) {
        return NextResponse.json(
          { erro: "Email já está em uso" },
          { status: 400 }
        );
      }
    }

    // Se estiver alterando a neutra, verifica se ela existe
    if (dadosAtualizacao.neutraId) {
      const neutra = await prisma.neutra.findUnique({
        where: { id: dadosAtualizacao.neutraId },
      });

      if (!neutra) {
        return NextResponse.json(
          { erro: "Neutra não encontrada" },
          { status: 404 }
        );
      }
    }

    // Se estiver alterando a porta, verifica se ela existe e está livre
    if (dadosAtualizacao.portaId && dadosAtualizacao.portaId !== clienteExistente.portaId) {
      const porta = await prisma.porta.findUnique({
        where: { id: dadosAtualizacao.portaId },
      });

      if (!porta) {
        return NextResponse.json(
          { erro: "Porta não encontrada" },
          { status: 404 }
        );
      }

      if (porta.status !== "Disponível") {
        return NextResponse.json(
          { erro: "A porta selecionada não está livre" },
          { status: 400 }
        );
      }
    }

    // Hash da senha, se fornecida
    if (dadosAtualizacao.senha) {
      dadosAtualizacao.senha = await bcrypt.hash(dadosAtualizacao.senha, 10);
    }

    // Remove campos que não existem na tabela Cliente
    const { status, ...dadosLimpos } = dadosAtualizacao;

    // Atualiza o cliente no banco de dados
    const clienteAtualizado = await prisma.$transaction(async (prisma) => {
      // Se estiver alterando a porta, atualiza o status das portas
      if (dadosLimpos.portaId && dadosLimpos.portaId !== clienteExistente.portaId) {
        // Libera a porta anterior
        if (clienteExistente.portaId) {
          await prisma.porta.update({
            where: { id: clienteExistente.portaId },
            data: { status: "Livre" },
          });
        }

        // Marca a nova porta como em uso
        await prisma.porta.update({
          where: { id: dadosLimpos.portaId },
          data: { status: "Em uso" },
        });
      }

      // Atualiza o cliente
      return prisma.cliente.update({
        where: { id },
        data: dadosLimpos,
      });
    });

    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);
    if (token) {
      // Remove a senha dos detalhes do log
      const { senha, ...detalhesLog } = dadosLimpos;
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Atualização",
        entidade: "Cliente",
        entidadeId: id,
        detalhes: detalhesLog,
      });
    }

    // Remove a senha do resultado
    const { senha: _, ...clienteSemSenha } = clienteAtualizado;
    return NextResponse.json({
      mensagem: "Cliente atualizado com sucesso",
      cliente: clienteSemSenha,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * DELETE - Remove um cliente específico por ID
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (apenas Gerentes podem excluir clientes)
    const permissaoErro = await verificarPermissao(req, ["Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se o cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        portaId: true,
      },
    });

    if (!cliente) {
      return NextResponse.json(
        { erro: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    // Exclui o cliente e libera a porta em uma transação
    await prisma.$transaction(async (prisma) => {
      // Exclui o cliente
      await prisma.cliente.delete({
        where: { id },
      });

      // Libera a porta
      if (cliente.portaId) {
        await prisma.porta.update({
          where: { id: cliente.portaId },

          data: { status: "Livre" },
        });
      }
    });

    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Exclusão",
        entidade: "Cliente",
        entidadeId: id,
        detalhes: { nome: cliente.nome, email: cliente.email },
      });
    }

    return NextResponse.json({
      mensagem: "Cliente excluído com sucesso",
    });
  } catch (error) {
    return tratarErro(error);
  }
}