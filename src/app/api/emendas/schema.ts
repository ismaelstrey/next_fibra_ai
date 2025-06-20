// src/app/api/emendas/schema.ts

import { z } from "zod";

/**
 * Esquema para criação e atualização de emenda
 */
export const emendaSchema = z.object({
  localizacao: z.string().min(2, "Localização deve ter pelo menos 2 caracteres"),
  capilarSaidaId: z.string(),
  capilarEntradaId: z.string(),
});

/**
 * Esquema para atualização parcial de emenda
 */
export const atualizarEmendaSchema = emendaSchema.partial();