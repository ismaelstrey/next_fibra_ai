// src/types/next-auth.d.ts

import { DefaultSession } from "next-auth";

/**
 * Extensão dos tipos do NextAuth para incluir campos personalizados
 */
declare module "next-auth" {
  /**
   * Extensão do tipo User para incluir campos personalizados
   */
  interface User {
    id: string;
    cargo: string;
  }

  /**
   * Extensão do tipo Session para incluir campos personalizados no objeto user
   */
  interface Session {
    user: {
      id: string;
      cargo: string;
    } & DefaultSession["user"];
  }
}

/**
 * Extensão dos tipos do JWT para incluir campos personalizados
 */
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    cargo: string;
  }
}