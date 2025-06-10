// src/app/api/notificacoes/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../../utils";
import { atualizarNotificacaoSchema, marcarNotificacaoSchema } from "../schema";

/**
 * Função auxiliar para verificar se o usuário tem acesso à notificação
 */
async function verificarAcessoNotificacao(req: NextRequest, notificacaoId: string) {
  const token = await verificarAutenticacao(req);
  if (!token) {
    return { erro: NextResponse.json({ erro: "Não autorizado" }, { status: 401 }) };
  }

  // Busca a notificação
  const notificacao = await prisma.notificacao.findUnique({
    where: { id: notificacaoId },
    select: {
      id: true,
      titulo: true,
      conteudo: true,
      tipo: true,
      prioridade: true,
      criadorId: true,
      cargoDestinatarios: true,
      destinatarios: {
        where: {
          id: token.id as string,
        },
        select: {
          id: true,
        },
      },
    },
  });

  if (!notificacao) {
    return { erro: NextResponse.json({ erro: "Notificação não encontrada" }, { status: 404 }) };
  }

  // Verifica se o usuário é o criador da notificação
  const ehCriador = notificacao.criadorId === token.id;

  // Verifica se o usuário é um destinatário da notificação
  const ehDestinatario = notificacao.destinatarios.length > 0;

  // Verifica se o cargo do usuário está nos cargos de destinatários
  const cargoEhDestinatario = notificacao.cargoDestinatarios.includes(token.cargo as string);

  // Gerentes têm acesso a todas as notificações
  if (token.cargo === "Gerente" || ehCriador || ehDestinatario || cargoEhDestinatario) {
    return { temAcesso: true, token, notificacao, ehCriador };
  }

  return { erro: NextResponse.json({ erro: "Você não tem acesso a esta notificação" }, { status: 403 }) };
}

/**
 * GET - Obtém detalhes de uma notificação específica
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Verifica se o usuário tem acesso à notificação
    const acesso = await verificarAcessoNotificacao(req, id);
    if (acesso.erro) return acesso.erro;

    // Busca os detalhes completos da notificação
    const notificacao = await prisma.notificacao.findUnique({
      where: { id },
      select: {
        id: true,
        titulo: true,
        conteudo: true,
        tipo: true,
        prioridade: true,
        criadoEm: true,
        atualizadoEm: true,
        cidadeId: true,
        caixaId: true,
        rotaId: true,
        manutencaoId: true,
        criadorId: true,
        cargoDestinatarios: true,
        destinatarios: {
          select: {
            id: true,
            nome: true,
            email: true,
            cargo: true,
            imagem: true,
          },
        },
        notificacoesLidas: {
          where: {
            usuarioId: acesso.token?.id as string,
          },
          select: {
            lida: true,
            lidaEm: true,
          },
        },
        criador: {
          select: {
            id: true,
            nome: true,
            email: true,
            cargo: true,
            imagem: true,
          },
        },
        cidade: {
          select: {
            id: true,
            nome: true,
            estado: true,
          },
        },
        caixa: {
          select: {
            id: true,
            nome: true,
            tipo: true,
          },
        },
        rota: {
          select: {
            id: true,
            nome: true,
            tipoCabo: true,
          },
        },
        manutencao: {
          select: {
            id: true,
            titulo: true,
            status: true,
            tipo: true,
          },
        },
      },
    });

    // Processa a notificação para adicionar o status de leitura
    const statusLeitura = notificacao?.notificacoesLidas[0] || { lida: false, lidaEm: null };
    const { notificacoesLidas, ...resto } = notificacao!;

    const notificacaoProcessada = {
      ...resto,
      lida: statusLeitura.lida,
      lidaEm: statusLeitura.lidaEm,
    };

    return NextResponse.json(notificacaoProcessada);
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PATCH - Atualiza uma notificação específica
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Verifica se o usuário tem acesso à notificação
    const acesso = await verificarAcessoNotificacao(req, id);
    if (acesso.erro) return acesso.erro;

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Verifica se o usuário está tentando marcar a notificação como lida
    if ("lida" in body && Object.keys(body).length === 1) {
      // Valida os dados com o esquema Zod para marcar como lida
      const result = marcarNotificacaoSchema.safeParse(body);

      // Se a validação falhar, retorna os erros
      if (!result.success) {
        return NextResponse.json(
          { erro: "Dados inválidos", detalhes: result.error.format() },
          { status: 400 }
        );
      }

      const { lida } = result.data;

      // Verifica se já existe um registro de leitura para esta notificação e usuário
      const notificacaoLida = await prisma.notificacaoLida.findUnique({
        where: {
          notificacaoId_usuarioId: {
            notificacaoId: id,
            usuarioId: acesso.token?.id as string,
          },
        },
      });

      if (notificacaoLida) {
        // Atualiza o registro existente
        await prisma.notificacaoLida.update({
          where: {
            notificacaoId_usuarioId: {
              notificacaoId: id,
              usuarioId: acesso.token?.id as string,
            },
          },
          data: {
            lida,
            lidaEm: lida ? new Date() : null,
          },
        });
      } else {
        // Cria um novo registro
        await prisma.notificacaoLida.create({
          data: {
            notificacaoId: id,
            usuarioId: acesso.token?.id as string,
            lida,
            lidaEm: lida ? new Date() : null,
          },
        });
      }

      // Registra a ação no log de auditoria
      if (acesso.token) {
        await registrarLog({
          prisma,
          usuarioId: acesso.token.id as string,
          acao: lida ? "Marcação como lida" : "Marcação como não lida",
          entidade: "Notificação",
          entidadeId: id,
          detalhes: { lida },
        });
      }

      // Retorna mensagem de sucesso
      return NextResponse.json({
        mensagem: lida
          ? "Notificação marcada como lida"
          : "Notificação marcada como não lida",
      });
    }

    // Se não for uma operação de marcar como lida, verifica se o usuário é o criador ou gerente
    if (!acesso.ehCriador && acesso.token?.cargo !== "Gerente") {
      return NextResponse.json(
        { erro: "Você não tem permissão para atualizar esta notificação" },
        { status: 403 }
      );
    }

    // Valida os dados com o esquema Zod para atualização
    const result = atualizarNotificacaoSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const { titulo, conteudo, tipo, prioridade } = result.data;

    // Atualiza a notificação no banco de dados
    const notificacaoAtualizada = await prisma.notificacao.update({
      where: { id },
      data: {
        titulo,
        conteudo,
        tipo,
        prioridade,
      },
    });

    // Registra a ação no log de auditoria
    if (acesso.token) {
      await registrarLog({
        prisma,
        usuarioId: acesso.token.id as string,
        acao: "Atualização",
        entidade: "Notificação",
        entidadeId: id,
        detalhes: { titulo, conteudo, tipo, prioridade },
      });
    }

    // Retorna os dados da notificação atualizada
    return NextResponse.json({
      mensagem: "Notificação atualizada com sucesso",
      notificacao: notificacaoAtualizada,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * DELETE - Remove uma notificação específica
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Verifica se o usuário tem acesso à notificação
    const acesso = await verificarAcessoNotificacao(req, id);
    if (acesso.erro) return acesso.erro;

    // Apenas o criador da notificação ou um gerente pode excluí-la
    if (!acesso.ehCriador && acesso.token?.cargo !== "Gerente") {
      return NextResponse.json(
        { erro: "Você não tem permissão para excluir esta notificação" },
        { status: 403 }
      );
    }

    // Remove a notificação do banco de dados
    await prisma.notificacao.delete({
      where: { id },
    });

    // Registra a ação no log de auditoria
    if (acesso.token) {
      await registrarLog({
        prisma,
        usuarioId: acesso.token.id as string,
        acao: "Exclusão",
        entidade: "Notificação",
        entidadeId: id,
        detalhes: { id },
      });
    }

    // Retorna mensagem de sucesso
    return NextResponse.json({
      mensagem: "Notificação excluída com sucesso",
    });
  } catch (error) {
    return tratarErro(error);
  }
}