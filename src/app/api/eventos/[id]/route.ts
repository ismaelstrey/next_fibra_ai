// src/app/api/eventos/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../../utils";
import { atualizarEventoSchema } from "../schema";

/**
 * Função auxiliar para verificar se o usuário tem acesso ao evento
 */
async function verificarAcessoEvento(req: NextRequest, eventoId: string) {
  const token = await verificarAutenticacao(req);
  if (!token) {
    return { erro: NextResponse.json({ erro: "Não autorizado" }, { status: 401 }) };
  }

  // Busca o evento
  const evento = await prisma.evento.findUnique({
    where: { id: eventoId },
    select: {
      id: true,
      titulo: true,
      cidadeId: true,
      caixaId: true,
      rotaId: true,
      usuarioId: true,  
      participantes:{
        select:{
          id: true,
          nome: true,
          evento: true,
        }
      },
      cidade: {
        select: {
          id: true,
          usuarios: {
            where: {
              id: token.id as string,
            },
            select: {
              id: true,
            },
          },
        },
      },
      caixa: {
        select: {
          id: true,
          cidadeId: true,
          cidade: {
            select: {
              usuarios: {
                where: {
                  id: token.id as string,
                },
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
      rota: {
        select: {
          id: true,
          cidadeId: true,
          cidade: {
            select: {
              usuarios: {
                where: {
                  id: token.id as string,
                },
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
    }
  });

  if (!evento) {
    return { erro: NextResponse.json({ erro: "Evento não encontrado" }, { status: 404 }) };
  }

  // Verifica se o usuário é o criador do evento
  const ehCriador = evento.usuarioId=== token.id;

  // Verifica se o usuário é um participante do evento
  const ehParticipante = evento.participantes.length > 0;

  // Verifica se o usuário tem acesso à cidade do evento ou da caixa/rota associada
  let temAcessoCidade = false;

  // Gerentes têm acesso a todos os eventos
  if (token.cargo === "Gerente") {
    return { temAcesso: true, token, evento, ehCriador };
  }

  // Verifica acesso pela cidade diretamente associada ao evento
  if (evento.cidade && evento.cidade.usuarios.length > 0) {
    temAcessoCidade = true;
  }

  // Verifica acesso pela cidade da caixa associada ao evento
  if (evento.caixa && evento.caixa.cidade.usuarios.length > 0) {
    temAcessoCidade = true;
  }

  // Verifica acesso pela cidade da rota associada ao evento
  if (evento.rota && evento.rota.cidade.usuarios.length > 0) {
    temAcessoCidade = true;
  }

  if (ehCriador || ehParticipante || temAcessoCidade) {
    return { temAcesso: true, token, evento, ehCriador };
  }

  return { erro: NextResponse.json({ erro: "Você não tem acesso a este evento" }, { status: 403 }) };
}

/**
 * Função auxiliar para verificar se o usuário tem acesso à entidade (caixa, rota, cidade)
 */
async function verificarAcessoEntidade(req: NextRequest, cidadeId?: string, caixaId?: string, rotaId?: string) {
  const token = await verificarAutenticacao(req);
  if (!token) {
    return { erro: NextResponse.json({ erro: "Não autorizado" }, { status: 401 }) };
  }

  // Gerentes têm acesso a todas as entidades
  if (token.cargo === "Gerente") {
    return { temAcesso: true, token };
  }

  // Se foi especificada uma cidade, verifica se o usuário tem acesso
  if (cidadeId) {
    const cidade = await prisma.cidade.findUnique({
      where: { id: cidadeId },
      select: {
        id: true,
        usuarios: {
          where: {
            id: token.id as string,
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!cidade) {
      return { erro: NextResponse.json({ erro: "Cidade não encontrada" }, { status: 404 }) };
    }

    if (cidade.usuarios.length === 0) {
      return { erro: NextResponse.json({ erro: "Você não tem acesso a esta cidade" }, { status: 403 }) };
    }
  }

  // Se foi especificada uma caixa, verifica se o usuário tem acesso
  if (caixaId) {
    const caixa = await prisma.caixa.findUnique({
      where: { id: caixaId },
      select: {
        id: true,
        cidadeId: true,
        cidade: {
          select: {
            usuarios: {
              where: {
                id: token.id as string,
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!caixa) {
      return { erro: NextResponse.json({ erro: "Caixa não encontrada" }, { status: 404 }) };
    }

    if (caixa.cidade.usuarios.length === 0) {
      return { erro: NextResponse.json({ erro: "Você não tem acesso a esta caixa" }, { status: 403 }) };
    }
  }

  // Se foi especificada uma rota, verifica se o usuário tem acesso
  if (rotaId) {
    const rota = await prisma.rota.findUnique({
      where: { id: rotaId },
      select: {
        id: true,
        cidadeId: true,
        cidade: {
          select: {
            usuarios: {
              where: {
                id: token.id as string,
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!rota) {
      return { erro: NextResponse.json({ erro: "Rota não encontrada" }, { status: 404 }) };
    }

    if (rota.cidade.usuarios.length === 0) {
      return { erro: NextResponse.json({ erro: "Você não tem acesso a esta rota" }, { status: 403 }) };
    }
  }

  return { temAcesso: true, token };
}

/**
 * GET - Obtém detalhes de um evento específico
 */
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;

    // Verifica se o usuário tem acesso ao evento
    const acesso = await verificarAcessoEvento(req, id);
    if (acesso.erro) return acesso.erro;

    // Busca os detalhes completos do evento
    const evento = await prisma.evento.findUnique({
      where: { id },
      select: {
        id: true,
        titulo: true,
        descricao: true,
        dataInicio: true,
        dataFim: true,
        tipo: true,
        status: true,
        criadoEm: true,
        atualizadoEm: true,
        cidadeId: true,
        caixaId: true,
        rotaId: true,
        usuarioId: true,
        usuario: {
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
            cidade: {
              select: {
                id: true,
                nome: true,
                estado: true,
              },
            },
          },
        },
        rota: {
          select: {
            id: true,
            nome: true,
            tipoCabo: true,
            cidade: {
              select: {
                id: true,
                nome: true,
                estado: true,
              },
            },
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
        participantes: {
          select: {
            id: true,
            nome: true,
            usuarios:{
              select:{
                id: true,
                nome: true,
                email: true,
                cargo: true,
                imagem: true,
              }
            }
          },
        },
      },
    });

    return NextResponse.json(evento);
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PATCH - Atualiza um evento específico
 */
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;

    // Verifica se o usuário tem acesso ao evento
    const acesso = await verificarAcessoEvento(req, id);
    if (acesso.erro) return acesso.erro;

    // Apenas o criador do evento ou um gerente pode atualizar o evento
    if (!acesso.ehCriador && acesso.token?.cargo !== "Gerente") {
      return NextResponse.json(
        { erro: "Você não tem permissão para atualizar este evento" },
        { status: 403 }
      );
    }

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = atualizarEventoSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const { 
      titulo, 
      descricao, 
      dataInicio, 
      dataFim, 
      tipo, 
      status, 
      localizacao,
      cidadeId,
      caixaId,
      rotaId,
      manutencaoId,
      participantes
    } = result.data;

    // Se estiver alterando entidades relacionadas, verifica se o usuário tem acesso
    if (cidadeId || caixaId || rotaId) {
      const acessoEntidade = await verificarAcessoEntidade(
        req, 
        cidadeId || acesso.evento?.cidadeId || undefined, 
        caixaId || acesso.evento?.caixaId || undefined, 
        rotaId || acesso.evento?.rotaId || undefined
      );
      if (acessoEntidade.erro) return acessoEntidade.erro;
    }

    // Verifica se a manutenção existe, se especificada
    if (manutencaoId) {
      const manutencaoExiste = await prisma.manutencao.findUnique({
        where: { id: manutencaoId },
      });

      if (!manutencaoExiste) {
        return NextResponse.json(
          { erro: "Manutenção não encontrada" },
          { status: 404 }
        );
      }
    }

    // Verifica se os participantes existem
    if (participantes && participantes.length > 0) {
      const usuariosExistentes = await prisma.usuario.count({
        where: {
          id: {
            in: participantes,
          },
        },
      });

      if (usuariosExistentes !== participantes.length) {
        return NextResponse.json(
          { erro: "Um ou mais participantes não existem" },
          { status: 400 }
        );
      }
    }

    // Prepara os dados para atualização
    const dadosAtualizacao: any = {};

    if (titulo !== undefined) dadosAtualizacao.titulo = titulo;
    if (descricao !== undefined) dadosAtualizacao.descricao = descricao;
    if (dataInicio !== undefined) dadosAtualizacao.dataInicio = new Date(dataInicio);
    if (dataFim !== undefined) dadosAtualizacao.dataFim = new Date(dataFim);
    if (tipo !== undefined) dadosAtualizacao.tipo = tipo;
    if (status !== undefined) dadosAtualizacao.status = status;
    if (localizacao !== undefined) dadosAtualizacao.localizacao = localizacao;
    if (cidadeId !== undefined) dadosAtualizacao.cidadeId = cidadeId;
    if (caixaId !== undefined) dadosAtualizacao.caixaId = caixaId;
    if (rotaId !== undefined) dadosAtualizacao.rotaId = rotaId;
    if (manutencaoId !== undefined) dadosAtualizacao.manutencaoId = manutencaoId;

    // Se participantes foi especificado, atualiza a relação
    if (participantes !== undefined) {
      // Primeiro desconecta todos os participantes atuais
      await prisma.evento.update({
        where: { id },
        data: {
          participantes: {
            set: [], // Remove todos os participantes atuais
          },
        },
      });

      // Adiciona os novos participantes
      if (participantes.length > 0) {
        dadosAtualizacao.participantes = {
          connect: participantes.map(participanteId => ({ id: participanteId })),
        };
      }
    }

    // Atualiza o evento no banco de dados
    const eventoAtualizado = await prisma.evento.update({
      where: { id },
      data: dadosAtualizacao,
    });

    // Registra a ação no log de auditoria
    if (acesso.token) {
      await registrarLog({
        prisma,
        usuarioId: acesso.token.id as string,
        acao: "Atualização",
        entidade: "Evento",
        entidadeId: id,
        detalhes: { titulo, tipo, status },
      });
    }

    // Retorna os dados do evento atualizado
    return NextResponse.json({
      mensagem: "Evento atualizado com sucesso",
      evento: eventoAtualizado,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * DELETE - Remove um evento específico
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;

    // Verifica se o usuário tem acesso ao evento
    const acesso = await verificarAcessoEvento(req, id);
    if (acesso.erro) return acesso.erro;

    // Apenas o criador do evento ou um gerente pode excluir o evento
    if (!acesso.ehCriador && acesso.token?.cargo !== "Gerente") {
      return NextResponse.json(
        { erro: "Você não tem permissão para excluir este evento" },
        { status: 403 }
      );
    }

    // Remove o evento do banco de dados
    await prisma.evento.delete({
      where: { id },
    });

    // Registra a ação no log de auditoria
    if (acesso.token) {
      await registrarLog({
        prisma,
        usuarioId: acesso.token.id as string,
        acao: "Exclusão",
        entidade: "Evento",
        entidadeId: id,
        detalhes: { id },
      });
    }

    // Retorna mensagem de sucesso
    return NextResponse.json({
      mensagem: "Evento excluído com sucesso",
    });
  } catch (error) {
    return tratarErro(error);
  }
}