// src/app/api/incidentes/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { verificarPermissao, tratarErro, verificarAutenticacao, registrarLog } from "../../utils";
import { atualizarIncidenteSchema } from "../schema";

/**
 * Função auxiliar para verificar se o usuário tem acesso ao incidente
 */
async function verificarAcessoIncidente(req: NextRequest, incidenteId: string) {
  const token = await verificarAutenticacao(req);
  if (!token) {
    return { erro: NextResponse.json({ erro: "Não autorizado" }, { status: 401 }) };
  }

  // Busca o incidente com informações relacionadas
  const incidente = await prisma.incidente.findUnique({
    where: { id: incidenteId },
    include: {
      caixa: token.cargo !== "Gerente" ? {
        select: {
          id: true,
          nome: true,
          tipo: true,
          cidadeId: true,
          cidade: {
            select: {
              id: true,
              nome: true,
              estado: true,
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
        }
      } : true,
      capilar: token.cargo !== "Gerente" ? {
        select: {
          id: true,
          numero: true,
          tipo: true,
          cidadeId: true,
          cidade: {
            select: {
              id: true,
              nome: true,
              estado: true,
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
        }
      } : true,
      emenda: token.cargo !== "Gerente" ? {
        select: {
          id: true,
          localizacao: true,
          cidadeId: true,
          cidade: {
            select: {
              id: true,
              nome: true,
              estado: true,
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
        }
      } : true,
      cliente: token.cargo !== "Gerente" ? {
        select: {
          id: true,
          nome: true,
          cidadeId: true,
          cidade: {
            select: {
              id: true,
              nome: true,
              estado: true,
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
        }
      } : true,
      equipamento: token.cargo !== "Gerente" ? {
        select: {
          id: true,
          nome: true,
          modelo: true,
          tipo: true,
          caixa: {
            select: {
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
          emenda: {
            select: {
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
          cliente: {
            select: {
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
      } : true,
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
          cargo: true,
          imagem: true,
        },
      },
    },
  });

  if (!incidente) {
    return { erro: NextResponse.json({ erro: "Incidente não encontrado" }, { status: 404 }) };
  }

  // Gerentes têm acesso a todos os incidentes
  if (token.cargo === "Gerente") {
    return { temAcesso: true, token, incidente };
  }

  // Verifica se o usuário tem acesso à cidade da caixa, capilar, emenda, cliente ou equipamento
  let temAcesso = false;

  if (incidente.caixa && incidente.caixa?.cidadeId === token.cidadeId) {
    temAcesso = true;
  }

  if (!temAcesso && incidente.capilar && incidente.capilar?.cidadeId === token.cidadeId) {
    temAcesso = true;
  }

  if (!temAcesso && incidente.emenda && incidente.emenda?.cidadeId === token.cidadeId) {
    temAcesso = true;
  }

  if (!temAcesso && incidente.cliente && incidente.cliente?.cidadeId === token.cidadeId) {
    temAcesso = true;
  }



  // O usuário que criou o incidente também tem acesso
  if (incidente.usuarioId === token.id) {
    temAcesso = true;
  }

  if (!temAcesso) {
    return { erro: NextResponse.json({ erro: "Você não tem acesso a este incidente" }, { status: 403 }) };
  }

  return { temAcesso, token, incidente };
}

/**
 * GET - Obtém um incidente específico por ID
 */
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;

    // Verifica se o usuário tem acesso ao incidente
    const acesso = await verificarAcessoIncidente(req, id);
    if (acesso.erro) return acesso.erro;

    // Retorna o incidente com todas as informações relacionadas
    return NextResponse.json(acesso.incidente);
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * PATCH - Atualiza um incidente específico por ID
 */
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (Técnicos, Engenheiros e Gerentes podem atualizar incidentes)
    const permissaoErro = await verificarPermissao(req, ["Técnico", "Engenheiro", "Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se o usuário tem acesso ao incidente
    const acesso = await verificarAcessoIncidente(req, id);
    if (acesso.erro) return acesso.erro;

    // Extrai os dados do corpo da requisição
    const body = await req.json();

    // Valida os dados com o esquema Zod
    const result = atualizarIncidenteSchema.safeParse(body);

    // Se a validação falhar, retorna os erros
    if (!result.success) {
      return NextResponse.json(
        { erro: "Dados inválidos", detalhes: result.error.format() },
        { status: 400 }
      );
    }

    const { caixaId, capilarId, emendaId, clienteId, equipamentoId } = result.data;

    // Se estiver atualizando algum ID relacionado, verifica se o usuário tem acesso
    if (caixaId || capilarId || emendaId || clienteId || equipamentoId) {
      // Verifica se as entidades existem e se o usuário tem acesso
      if (caixaId) {
        const caixa = await prisma.caixa.findUnique({
          where: { id: caixaId },
          select: {
            id: true,
            cidadeId: true,
            cidade: acesso.token.cargo !== "Gerente" ? {
              select: {
                usuarios: {
                  where: {
                    id: acesso.token.id as string,
                  },
                  select: {
                    id: true,
                  },
                },
              },
            } : undefined,
          },
        });

        if (!caixa) {
          return NextResponse.json(
            { erro: "Caixa não encontrada" },
            { status: 404 }
          );
        }

        if (acesso.token.cargo !== "Gerente" && caixa.cidade?.id) {
          return NextResponse.json(
            { erro: "Você não tem acesso a esta caixa" },
            { status: 403 }
          );
        }
      }

      if (capilarId) {
        const capilar = await prisma.capilar.findUnique({
          where: { id: capilarId },
          select: {
            id: true,
            cidadeId: true,
            cidade: acesso.token.cargo !== "Gerente" ? {
              select: {
                usuarios: {
                  where: {
                    id: acesso.token.id as string,
                  },
                  select: {
                    id: true,
                  },
                },
              },
            } : undefined,
          },
        });

        if (!capilar) {
          return NextResponse.json(
            { erro: "Capilar não encontrado" },
            { status: 404 }
          );
        }

      }
    }

    if (emendaId) {
      const emenda = await prisma.emenda.findUnique({
        where: { id: emendaId },
        select: {
          id: true,
          cidadeId: true,
          cidade: acesso.token.cargo !== "Gerente" ? {
            select: {
              usuarios: {
                where: {
                  id: acesso.token.id as string,
                },
                select: {
                  id: true,
                },
              },
            },
          } : undefined,
        },
      });

      if (!emenda) {
        return NextResponse.json(
          { erro: "Emenda não encontrada" },
          { status: 404 }
        );
      }

    }

    if (clienteId) {
      const cliente = await prisma.cliente.findUnique({
        where: { id: clienteId },
        select: {
          id: true,
          cidadeId: true,
          cidade: acesso.token.cargo !== "Gerente" ? {
            select: {
              usuarios: {
                where: {
                  id: acesso.token.id as string,
                },
                select: {
                  id: true,
                },
              },
            },
          } : undefined,
        },
      });

      if (!cliente) {
        return NextResponse.json(
          { erro: "Cliente não encontrado" },
          { status: 404 }
        );
      }


    }

    if (equipamentoId) {
      const equipamento = await prisma.equipamento.findUnique({
        where: { id: equipamentoId },
        include: {
          caixa: acesso.token.cargo !== "Gerente" ? {
            select: {
              cidadeId: true,
              cidade: {
                select: {
                  usuarios: {
                    where: {
                      id: acesso.token.id as string,
                    },
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          } : undefined,
          emenda: acesso.token.cargo !== "Gerente" ? {
            select: {
              cidadeId: true,
              cidade: {
                select: {
                  usuarios: {
                    where: {
                      id: acesso.token.id as string,
                    },
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          } : undefined,
          cliente: acesso.token.cargo !== "Gerente" ? {
            select: {
              cidadeId: true,
              cidade: {
                select: {
                  usuarios: {
                    where: {
                      id: acesso.token.id as string,
                    },
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          } : undefined,
        },
      });

      if (!equipamento) {
        return NextResponse.json(
          { erro: "Equipamento não encontrado" },
          { status: 404 }
        );
      }


    }


    // Atualiza o incidente no banco de dados
    const incidenteAtualizado = await prisma.incidente.update({
      where: { id },
      data: result.data,
    });

    // Registra a ação no log de auditoria
    await registrarLog({
      prisma,
      usuarioId: acesso.token.id as string,
      acao: "Atualização",
      entidade: "Incidente",
      entidadeId: id,
      detalhes: result.data,
    });

    return NextResponse.json({
      mensagem: "Incidente atualizado com sucesso",
      incidente: incidenteAtualizado,
    });
  } catch (error) {
    return tratarErro(error);
  }
}

/**
 * DELETE - Remove um incidente específico por ID
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verifica se o usuário tem permissão (apenas Gerentes podem excluir incidentes)
    const permissaoErro = await verificarPermissao(req, ["Gerente"]);
    if (permissaoErro) return permissaoErro;

    const { id } = params;

    // Verifica se o usuário tem acesso ao incidente
    const acesso = await verificarAcessoIncidente(req, id);
    if (acesso.erro) return acesso.erro;

    // Exclui o incidente
    await prisma.incidente.delete({
      where: { id },
    });

    // Registra a ação no log de auditoria
    await registrarLog({
      prisma,
      usuarioId: acesso.token.id as string,
      acao: "Exclusão",
      entidade: "Incidente",
      entidadeId: id,
      detalhes: { id },
    });

    return NextResponse.json({
      mensagem: "Incidente excluído com sucesso",
    });
  } catch (error) {
    return tratarErro(error);
  }
}