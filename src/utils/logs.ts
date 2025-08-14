// src/utils/logs.ts

import { PrismaClient } from "@prisma/client";
import { UsuarioToken } from "../middlewares/auth";

const prisma = new PrismaClient();

// Tipos de ações para logs
export type TipoAcao =
  | "criar"
  | "atualizar"
  | "excluir"
  | "consultar"
  | "login"
  | "logout"
  | "erro"
  | "outro";

/**
 * Registra uma ação do usuário no sistema
 * @param usuario - Dados do usuário que realizou a ação
 * @param recurso - Recurso afetado (ex: "usuarios", "caixas")
 * @param acao - Tipo de ação realizada
 * @param detalhes - Detalhes adicionais da ação
 * @param entidadeId - ID da entidade afetada (opcional)
 * @returns Promise com o log criado
 */
export async function registrarLog(
  usuario: UsuarioToken | null,
  recurso: string,
  acao: TipoAcao,
  detalhes: string,
  entidadeId?: string,
) {
  try {
    return await prisma.log.create({
      data: {
        usuarioId: usuario?.id || "N/A",
        acao,
        detalhes,
        entidadeId: entidadeId || "N/A",
        entidade: recurso,
        criadoEm: new Date(),
      },
    });
  } catch (error) {
    // Apenas registra o erro, mas não interrompe o fluxo da aplicação
    console.error("Erro ao registrar log:", error);
  }
}

/**
 * Registra um erro no sistema
 * @param erro - Erro capturado
 * @param recurso - Recurso onde ocorreu o erro
 * @param usuario - Dados do usuário (opcional)
 * @returns Promise com o log criado
 */
export async function registrarErro(
  erro: unknown,
  recurso: string,
  usuario: UsuarioToken | null = null
) {
  const mensagem = erro instanceof Error ? erro.message : String(erro);
  const stack = erro instanceof Error ? erro.stack : undefined;

  return registrarLog(
    usuario,
    recurso,
    "erro",
    `Erro: ${mensagem}${stack ? `\nStack: ${stack}` : ""}`
  );
}

/**
 * Registra uma tentativa de acesso não autorizado
 * @param usuario - Dados do usuário (se disponível)
 * @param recurso - Recurso que tentou acessar
 * @param acao - Ação que tentou realizar
 * @returns Promise com o log criado
 */
export async function registrarAcessoNegado(
  usuario: UsuarioToken | null,
  recurso: string,
  acao: TipoAcao
) {
  return registrarLog(
    usuario,
    recurso,
    acao,
    `Acesso negado ao recurso ${recurso} para ação ${acao}`
  );
}