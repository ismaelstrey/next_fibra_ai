// src/app/api/spliters/schema.ts

import { z } from "zod";

/**
 * Esquema para criação e atualização de spliter
 */
export const spliterSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  atendimento: z.boolean().default(true),
  tipo: z.string().min(2, "Tipo deve ter pelo menos 2 caracteres"),
  caixaId: z.string(),
  capilarSaidaId: z.string().optional().nullable(),
  capilarEntradaId: z.string().optional().nullable(),

});

/**
 * Esquema para atualização parcial de spliter
 */
export const atualizarSpliterSchema = spliterSchema.partial();