// src/utils/permissoes.ts

import { NextRequest } from "next/server";
import { UsuarioToken, extrairTokenJWT, verificarPermissaoRecurso } from "../middlewares/auth";

/**
 * Verifica se o usuário tem permissão para acessar um recurso específico
 * @param req - Requisição Next.js
 * @param recurso - Nome do recurso (ex: "usuarios", "caixas")
 * @param acao - Ação desejada ("ler", "criar", "atualizar", "excluir", "admin")
 * @returns Objeto com status da verificação e dados do usuário
 */
export async function verificarPermissao(
  req: NextRequest | Request,
  recurso: string,
  acao: "ler" | "criar" | "atualizar" | "excluir" | "admin"
): Promise<{ autorizado: boolean; usuario: UsuarioToken | null; mensagem?: string }> {
  // Extrai o token do cabeçalho de autorização
  const authHeader = req.headers.get("authorization");
  const usuario = await extrairTokenJWT(authHeader);

  // Se não houver usuário autenticado
  if (!usuario) {
    return { 
      autorizado: false, 
      usuario: null, 
      mensagem: "Usuário não autenticado" 
    };
  }

  // Verifica se o usuário tem permissão para o recurso e ação
  const temPermissao = verificarPermissaoRecurso(usuario, recurso, acao);

  return {
    autorizado: temPermissao,
    usuario,
    mensagem: temPermissao ? undefined : `Sem permissão para ${acao} em ${recurso}`
  };
}

/**
 * Verifica se o usuário tem acesso a uma cidade específica
 * @param usuario - Dados do usuário do token
 * @param cidadeId - ID da cidade a ser verificada
 * @returns Verdadeiro se o usuário tem acesso à cidade
 */
export function verificarAcessoCidade(usuario: UsuarioToken, cidadeId: string): boolean {
  // Gerentes têm acesso a todas as cidades
  if (usuario.cargo === "Gerente") {
    return true;
  }

  // Verifica se o ID da cidade está na lista de cidades do usuário
  return usuario.cidadesIds?.includes(cidadeId) || false;
}

/**
 * Verifica se o usuário tem acesso a um conjunto de recursos
 * @param usuario - Dados do usuário do token
 * @param verificacoes - Array de verificações de recursos e ações
 * @returns Verdadeiro se o usuário tem acesso a todos os recursos
 */
export function verificarMultiplasPermissoes(
  usuario: UsuarioToken,
  verificacoes: Array<{ recurso: string; acao: "ler" | "criar" | "atualizar" | "excluir" | "admin" }>
): boolean {
  // Gerentes têm acesso a tudo
  if (usuario.cargo === "Gerente") {
    return true;
  }

  // Verifica cada permissão necessária
  return verificacoes.every(({ recurso, acao }) => 
    verificarPermissaoRecurso(usuario, recurso, acao)
  );
}