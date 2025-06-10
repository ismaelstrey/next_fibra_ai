// src/app/api/caixas/[id]/bandejas/schema.ts

import { z } from "zod";

/**
 * Esquema para atualização de uma bandeja
 */
export const atualizarBandejaSchema = z.object({
  capacidade: z.number().int().positive(),
  observacoes: z.string().optional().nullable(),
});

/**
 * Esquema para atualização em lote de bandejas
 */
export const atualizarBandejasEmLoteSchema = z.object({
  bandejas: z.array(z.object({
    id: z.string(),
    capacidade: z.number().int().positive().optional(),
    observacoes: z.string().optional().nullable(),
  })),
});