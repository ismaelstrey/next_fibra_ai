// src/app/api/neutras/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../../utils";
import { atualizarNeutraSchema } from "../schema";

/**
 * GET - Obtém uma neutra específica por ID
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

    // Busca a neutra com todas as informações relacionadas
    const neutra = await prisma.neutra.findUnique({
      where: { id },
      include: {
        Cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            endereco: true,
            numero: true,
            potencia: true,
            wifi: true,
            porta: {
              select: {
                id: true,
                numero: true,
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
        },
        _count: {
          select: {
            Cliente: true,
          },
        },
      },
    });

    if (!neutra) {
      return NextResponse.json(
        { erro: "Neutra não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(neutra);
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PATCH - Atualiza uma neutra específica por ID
 */
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem atualizar neutras)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se a neutra existe
    const neutraExistente = await prisma.neutra.findUnique({
      where: { id },
      select: {
        id: true,
        vlan: true,
        _count: {
          select: {
            Cliente: true,
          },
        },
      },
    });

    if (!neutraExistente) {
      return NextResponse.json(
        { erro: "Neutra não encontrada" },
        { status: 404 }
      );
    }

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = atualizarNeutraSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const dadosAtualizacao = result.data;

    // Se estiver alterando a VLAN, verifica se já existe outra neutra com essa VLAN
    if (dadosAtualizacao.vlan && dadosAtualizacao.vlan !== neutraExistente.vlan) {
      const vlanEmUso = await prisma.neutra.findFirst({
        where: {
          id: { not: id },
          vlan: dadosAtualizacao.vlan,
        },
      });

      if (vlanEmUso) {
        return NextResponse.json(
          { erro: `Já existe uma neutra com a VLAN ${dadosAtualizacao.vlan}` },
          { status: 400 }
        );
      }
    }

    // Atualiza a neutra no banco de dados
    const neutraAtualizada = await prisma.neutra.update({
      where: { id },
      data: dadosAtualizacao,
    });

    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Atualização",
        entidade: "Neutra",
        entidadeId: id,
        detalhes: dadosAtualizacao,
      });
    }

    return NextResponse.json({
      mensagem: "Neutra atualizada com sucesso",
      neutra: neutraAtualizada,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * DELETE - Remove uma neutra específica por ID
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (apenas Gerentes podem excluir neutras)
    const permissaoErro = await verificarPermissao(req, ["Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se a neutra existe
    const neutra = await prisma.neutra.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        vlan: true,
        _count: {
          select: {
            Cliente: true,
          },
        },
      },
    });

    if (!neutra) {
      return NextResponse.json(
        { erro: "Neutra não encontrada" },
        { status: 404 }
      );
    }

    // Verifica se existem clientes associados
    if (neutra._count.Cliente > 0) {
      return NextResponse.json(
        { erro: `Não é possível excluir a neutra porque existem ${neutra._count.Cliente} clientes associados` },
        { status: 400 }
      );
    }

    // Exclui a neutra
    await prisma.neutra.delete({
      where: { id },
    });

    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Exclusão",
        entidade: "Neutra",
        entidadeId: id,
        detalhes: { nome: neutra.nome, vlan: neutra.vlan },
      });
    }

    return NextResponse.json({
      mensagem: "Neutra excluída com sucesso",
    });
  } catch (error) {
    return tratarErro(error);
  }
}