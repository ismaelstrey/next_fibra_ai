// src/app/api/bandejas/schema.ts

import { z } from "zod";

/**
 * Esquema para validação de criação de bandeja
 */
export const bandejaSchema = z.object({
  numero: z.number().int().positive("Número deve ser um inteiro positivo"),
  status: z.enum(["Disponível", "Em uso", "Reservada", "Defeito"]),
  caixaId: z.string().uuid("ID da caixa inválido"),
});

/**
 * Esquema para validação de atualização parcial de bandeja
 */
export const atualizarBandejaSchema = z.object({
  numero: z.number().int().positive("Número deve ser um inteiro positivo").optional(),
  status: z.enum(["Disponível", "Em uso", "Reservada", "Defeito"]).optional(),
  caixaId: z.string().uuid("ID da caixa inválido").optional(),
});