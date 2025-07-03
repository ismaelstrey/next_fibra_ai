// src/app/api/caixas/schema.ts

import { z } from "zod";

/**
 * Esquema para validação de coordenadas geográficas
 */
const coordenadaSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

/**
 * Esquema para criação e atualização de caixa
 */
export const caixaSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  tipo: z.enum(["CTO", "CEO"], {
    errorMap: () => ({ message: "Tipo deve ser CTO ou CEO" })
  }),
  modelo: z.string(),
  capacidade: z.number().int().positive(),
  coordenadas: coordenadaSchema,
  observacoes: z.string().optional().nullable(),
  cidadeId: z.string(),
  rotaIds: z.array(z.string()).optional(), // Aceita múltiplas rotas
});

/**
 * Esquema para atualização parcial de caixa
 */
export const atualizarCaixaSchema = caixaSchema.partial();