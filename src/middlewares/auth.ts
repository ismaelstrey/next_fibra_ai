// src/middlewares/auth.ts

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { jwtVerify } from "jose";

// Definição de tipos para permissões
export type Permissao = {
  recurso: string;
  acoes: Array<"ler" | "criar" | "atualizar" | "excluir" | "admin">;
};

export type UsuarioToken = {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  permissoes: Permissao[];
  cidadesIds?: string[];
  iat?: number;
  exp?: number;
};

/**
 * Middleware de autenticação para proteger rotas
 * @param req - Requisição Next.js
 * @returns Resposta Next.js ou undefined para continuar
 */
export async function autenticarRota(req: NextRequest) {
  const caminhoAtual = req.nextUrl.pathname;

  // Lista de rotas públicas que não requerem autenticação
  const rotasPublicas = ["/login", "/registro", "/recuperar-senha", "/"];
  const ehRotaPublica = rotasPublicas.some((rota) => caminhoAtual === rota || caminhoAtual.startsWith(`${rota}/`));

  // Lista de rotas de API que não requerem autenticação
  const rotasApiPublicas = ["/api/auth", "/api/registro", "/api/docs"];
  const ehRotaApiPublica = rotasApiPublicas.some((rota) => caminhoAtual.startsWith(rota));

  // Se for uma rota pública ou de API pública, permite o acesso
  if (ehRotaPublica || ehRotaApiPublica) {
    return NextResponse.next();
  }

  try {
    // Tenta obter o token JWT da requisição
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    // Se não houver token, redireciona para o login
    if (!token) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", encodeURI(caminhoAtual));
      return NextResponse.redirect(url);
    }

    // Verifica permissões baseadas no cargo e nas permissões do usuário
    const cargo = token.cargo as string;
    const permissoes = token.permissoes as Permissao[] || [];

    // Mapeamento de rotas para recursos e ações necessárias
    const rotasProtegidas = [
      { caminho: "/dashboard/usuarios", recurso: "usuarios", acao: "admin" },
      { caminho: "/dashboard/configuracoes", recurso: "configuracoes", acao: "admin" },
      // Adicione mais mapeamentos conforme necessário
    ];

    // Verifica se a rota atual requer permissões específicas
    const rotaProtegida = rotasProtegidas.find(rota => caminhoAtual.startsWith(rota.caminho));
    
    if (rotaProtegida) {
      // Gerentes têm acesso a tudo
      if (cargo === "Gerente") {
        return NextResponse.next();
      }

      // Verifica se o usuário tem a permissão necessária para a rota
      const temPermissao = permissoes.some(
        p => p.recurso === rotaProtegida.recurso && p.acoes.includes(rotaProtegida.acao as any)
      );

      if (!temPermissao) {
        // Redireciona para a página inicial se não tiver permissão
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Permite o acesso se todas as verificações passarem
    return NextResponse.next();
  } catch (error) {
    console.error("Erro na autenticação:", error);
    
    // Em caso de erro, redireciona para o login
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }
}

/**
 * Verifica se o usuário tem permissão para acessar um recurso específico
 * @param usuario - Dados do usuário do token
 * @param recurso - Nome do recurso (ex: "usuarios", "caixas")
 * @param acao - Ação desejada ("ler", "criar", "atualizar", "excluir", "admin")
 * @returns Booleano indicando se tem permissão
 */
export function verificarPermissaoRecurso(
  usuario: UsuarioToken,
  recurso: string,
  acao: "ler" | "criar" | "atualizar" | "excluir" | "admin"
): boolean {
  // Gerentes têm acesso total
  if (usuario.cargo === "Gerente") {
    return true;
  }

  // Verifica nas permissões do usuário
  return usuario.permissoes?.some(
    p => p.recurso === recurso && p.acoes.includes(acao)
  ) || false;
}

/**
 * Extrai e verifica o token JWT do cabeçalho de autorização
 * @param authHeader - Cabeçalho de autorização
 * @returns Dados do usuário do token ou null se inválido
 */
export async function extrairTokenJWT(authHeader: string | null): Promise<UsuarioToken | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = authHeader.split(" ")[1];
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as UsuarioToken;
  } catch (error) {
    console.error("Erro ao verificar token JWT:", error);
    return null;
  }
}