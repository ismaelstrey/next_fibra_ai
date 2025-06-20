// src/app/api/portas/schema.ts

import { z } from "zod";

/**
 * Esquema para validação de criação de porta
 */
export const portaSchema = z.object({
  numero: z.number().int().positive("Número deve ser um inteiro positivo"),
  status: z.enum(["Disponível", "Em uso", "Reservada", "Defeito"]),
  caixaId: z.string().uuid("ID da caixa inválido"),
  splitterId: z.string().uuid("ID do splitter inválido").optional(),
});

/**
 * Esquema para validação de atualização parcial de porta
 */
export const atualizarPortaSchema = z.object({
  numero: z.number().int().positive("Número deve ser um inteiro positivo").optional(),
  status: z.enum(["Disponível", "Em uso", "Reservada", "Defeito"]).optional(),
  caixaId: z.string().uuid("ID da caixa inválido").optional(),
  splitterId: z.string().uuid("ID do splitter inválido").optional().nullable(),
});