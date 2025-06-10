// src/app/api/fusoes/schema.ts

import { z } from "zod";

/**
 * Esquema para criação e atualização de fusão
 */
export const fusaoSchema = z.object({
  posicao: z.number().int().min(1),
  cor: z.string().optional(),
  origem: z.string(),
  destino: z.string(),
  observacoes: z.string().optional().nullable(),
  caixaId: z.string(),
  bandejaId: z.string().optional(),
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