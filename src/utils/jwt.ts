// src/utils/jwt.ts

import { SignJWT, jwtVerify } from "jose";
import { UsuarioToken } from "../middlewares/auth";

/**
 * Gera um token JWT para o usuário
 * @param payload - Dados do usuário a serem incluídos no token
 * @param expiresIn - Tempo de expiração em segundos (padrão: 24 horas)
 * @returns Token JWT gerado
 */
export async function gerarToken(
  payload: Omit<UsuarioToken, "iat" | "exp">,
  expiresIn: number = 60 * 60 * 24 // 24 horas em segundos
): Promise<string> {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("Variável de ambiente NEXTAUTH_SECRET não definida");
  }

  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresIn;

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(secret);
}

/**
 * Verifica e decodifica um token JWT
 * @param token - Token JWT a ser verificado
 * @returns Dados do usuário contidos no token ou null se inválido
 */
export async function verificarToken(token: string): Promise<UsuarioToken | null> {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("Variável de ambiente NEXTAUTH_SECRET não definida");
  }

  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as UsuarioToken;
  } catch (error) {
    console.error("Erro ao verificar token JWT:", error);
    return null;
  }
}

/**
 * Extrai o token JWT do cabeçalho de autorização
 * @param authHeader - Cabeçalho de autorização (Bearer token)
 * @returns Token JWT extraído ou null se inválido
 */
export function extrairTokenDoHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
}

/**
 * Verifica se um token JWT está expirado
 * @param token - Token JWT a ser verificado
 * @returns Verdadeiro se o token estiver expirado, falso caso contrário
 */
export async function tokenExpirado(token: string): Promise<boolean> {
  const payload = await verificarToken(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const agora = Math.floor(Date.now() / 1000);
  return payload.exp < agora;
}