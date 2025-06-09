// src/context/AuthContext.tsx

'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

/**
 * Provedor de contexto de autenticação para a aplicação
 * Utiliza o SessionProvider do NextAuth para gerenciar o estado de autenticação
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}