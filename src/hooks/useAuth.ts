// src/hooks/useAuth.ts

'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/**
 * Hook personalizado para gerenciar autenticação
 * Fornece funções e estados úteis para lidar com autenticação
 */
export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  /**
   * Função para realizar login
   * @param email - Email do usuário
   * @param senha - Senha do usuário
   * @param callbackUrl - URL para redirecionar após o login
   * @returns Promise com resultado do login
   */
  const fazerLogin = async (email: string, senha: string, callbackUrl?: string) => {

    console.log(email, senha, callbackUrl)
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        senha,
      });

      console.log(result)
      
      if (result?.error) {
        return { sucesso: false, erro: 'Credenciais inválidas' };
      }
      
      if (result?.ok) {
        // router.push(callbackUrl || '/');
        console.log(callbackUrl);
        return { sucesso: true };
      }
      
      return { sucesso: false, erro: 'Erro desconhecido' };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return { sucesso: false, erro: 'Erro ao processar login' };
    }
  };
  
  /**
   * Função para realizar logout
   * @param callbackUrl - URL para redirecionar após o logout
   */
  const fazerLogout = async (callbackUrl?: string) => {
    await signOut({ redirect: false });
    router.push(callbackUrl || '/login');
  };
  
  /**
   * Verifica se o usuário tem um cargo específico
   * @param cargo - Cargo a ser verificado
   * @returns Boolean indicando se o usuário tem o cargo
   */
  const temCargo = (cargo: string) => {
    return session?.user?.cargo === cargo;
  };
  
  return {
    session,
    usuario: session?.user,
    carregando: status === 'loading',
    autenticado: status === 'authenticated',
    fazerLogin,
    fazerLogout,
    temCargo,
  };
}