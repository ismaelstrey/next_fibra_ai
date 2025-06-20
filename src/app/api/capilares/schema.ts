// src/app/api/capilares/schema.ts

import { z } from "zod";

/**
 * Esquema para criação e atualização de capilar
 */
export const capilarSchema = z.object({
  numero: z.number().int().positive(),
  tipo: z.string().min(2, "Tipo deve ter pelo menos 2 caracteres"),
  comprimento: z.number().positive(),
  status: z.string().min(2, "Status deve ter pelo menos 2 caracteres"),
  potencia: z.number(),
  rotaId: z.string().optional()
});

/**
 * Esquema para atualização parcial de capilar
 */
export const atualizarCapilarSchema = capilarSchema.partial();