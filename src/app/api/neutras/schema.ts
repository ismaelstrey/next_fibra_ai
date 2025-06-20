// src/app/api/neutras/schema.ts

import { z } from "zod";

/**
 * Esquema para criação e atualização de neutra
 */
export const neutraSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  vlan: z.number().int().positive(),
});

/**
 * Esquema para atualização parcial de neutra
 */
export const atualizarNeutraSchema = neutraSchema.partial();