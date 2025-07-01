// src/app/api/portas/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../../utils";
import { atualizarPortaSchema } from "../schema";

/**
 * GET - Obtém uma porta específica por ID
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

    console.log(id)

    // Busca a porta com todas as informações relacionadas
    const porta = await prisma.porta.findUnique({
      where: { id },
      include: {
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

        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            endereco: true,
            numero: true,
            casa: true,
            apartamento: true,
            potencia: true,
            wifi: true,
            senhaWifi: true,
          },
        },
      },
    });

    if (!porta) {
      return NextResponse.json(
        { erro: "Porta não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(porta);
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PATCH - Atualiza uma porta específica por ID
 */
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (Engenheiros e Gerentes podem atualizar portas)
    const permissaoErro = await verificarPermissao(req, ["Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se a porta existe
    const portaExistente = await prisma.porta.findUnique({
      where: { id },
      include: {
        cliente: true,
      },
    });

    if (!portaExistente) {
      return NextResponse.json(
        { erro: "Porta não encontrada" },
        { status: 404 }
      );
    }

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = atualizarPortaSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const dadosAtualizacao = result.data;

    // Se estiver alterando o status e a porta estiver em uso por um cliente
    // if (dadosAtualizacao.status && dadosAtualizacao.status !== "Em uso" && portaExistente.cliente) {
    //   return NextResponse.json(
    //     { erro: "Não é possível alterar o status de uma porta que está em uso por um cliente" },
    //     { status: 400 }
    //   );
    // }

    // Se estiver alterando a caixa, verifica se ela existe e é do tipo CTO
    if (dadosAtualizacao.caixaId) {
      const caixa = await prisma.caixa.findUnique({
        where: { id: dadosAtualizacao.caixaId },
      });

      if (!caixa) {
        return NextResponse.json(
          { erro: "Caixa não encontrada" },
          { status: 404 }
        );
      }

      if (caixa.tipo !== "CTO") {
        return NextResponse.json(
          { erro: "Apenas caixas do tipo CTO podem ter portas" },
          { status: 400 }
        );
      }

      // Verifica se já existe uma porta com o mesmo número na nova caixa
      const numeroPorta = dadosAtualizacao.numero || portaExistente.numero;
      const portaExistenteNaCaixa = await prisma.porta.findFirst({
        where: {
          numero: numeroPorta,
          caixaId: dadosAtualizacao.caixaId,
          id: { not: id }, // Exclui a porta atual da verificação
        },
      });

      if (portaExistenteNaCaixa) {
        return NextResponse.json(
          { erro: `Já existe uma porta com o número ${numeroPorta} na caixa de destino` },
          { status: 400 }
        );
      }
    }

    // Se estiver alterando o número, verifica se já existe uma porta com o mesmo número na mesma caixa
    if (dadosAtualizacao.numero) {
      const caixaId = dadosAtualizacao.caixaId || portaExistente.caixaId;
      const portaExistenteComNumero = await prisma.porta.findFirst({
        where: {
          numero: dadosAtualizacao.numero,
          caixaId,
          id: { not: id }, // Exclui a porta atual da verificação
        },
      });

      if (portaExistenteComNumero) {
        return NextResponse.json(
          { erro: `Já existe uma porta com o número ${dadosAtualizacao.numero} nesta caixa` },
          { status: 400 }
        );
      }
    }

    // Se estiver alterando o splitter, verifica se ele existe
    if (dadosAtualizacao.splitterId !== undefined) {
      if (dadosAtualizacao.splitterId) {
        const splitter = await prisma.spliter.findUnique({
          where: { id: dadosAtualizacao.splitterId },
        });

        if (!splitter) {
          return NextResponse.json(
            { erro: "Splitter não encontrado" },
            { status: 404 }
          );
        }
      }
    }

    // Atualiza a porta no banco de dados
    const portaAtualizada = await prisma.porta.update({
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
        entidade: "Porta",
        entidadeId: id,
        detalhes: dadosAtualizacao,
      });
    }

    return NextResponse.json({
      mensagem: "Porta atualizada com sucesso",
      porta: portaAtualizada,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * DELETE - Remove uma porta específica por ID
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (apenas Gerentes podem excluir portas)
    const permissaoErro = await verificarPermissao(req, ["Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se a porta existe
    const porta = await prisma.porta.findUnique({
      where: { id },
      include: {
        cliente: true,
      },
    });

    if (!porta) {
      return NextResponse.json(
        { erro: "Porta não encontrada" },
        { status: 404 }
      );
    }

    // Verifica se a porta está em uso por um cliente
    if (porta.cliente) {
      return NextResponse.json(
        { erro: "Não é possível excluir uma porta que está em uso por um cliente" },
        { status: 400 }
      );
    }

    // Exclui a porta
    await prisma.porta.delete({
      where: { id },
    });

    // Registra a ação no log de auditoria
    const token = await verificarAutenticacao(req);
    if (token) {
      await registrarLog({
        prisma,
        usuarioId: token.id as string,
        acao: "Exclusão",
        entidade: "Porta",
        entidadeId: id,
        detalhes: { numero: porta.numero, status: porta.status },
      });
    }

    return NextResponse.json({
      mensagem: "Porta excluída com sucesso",
    });
  } catch (error) {
    return tratarErro(error);
  }
}