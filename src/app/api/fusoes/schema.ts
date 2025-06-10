// src/app/api/fusoes/schema.ts

import { z } from "zod";

/**
 * Esquema para criação e atualização de fusão
 */
export const fusaoSchema = z.object({
  fibraOrigem: z.number().int().min(1),
  fibraDestino: z.number().int().min(1),
  tuboOrigem: z.string().optional().nullable(),
  tuboDestino: z.string().optional().nullable(),
  status: z.string(),
  cor: z.string().optional(),
  observacoes: z.string().optional().nullable(),
  caixaId: z.string(),
  bandejaId: z.string().optional(),
  rotaOrigemId: z.string(),
});

/**
 * Esquema para atualização parcial de fusão
 */
export const atualizarFusaoSchema = fusaoSchema.partial();

/**
 * Esquema para criação em lote de fusões
 */
export const criarFusoesEmLoteSchema = z.object({
  fusoes: z.array(fusaoSchema),
});