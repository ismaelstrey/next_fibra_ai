// src/app/api/clientes/schema.ts

import { z } from "zod";

/**
 * Esquema para criação e atualização de cliente
 */
export const clienteSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional(),
  telefone: z.string().optional().nullable(),
  apartamento: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  casa: z.string().optional().nullable(),
  numero: z.number().int().positive(),
  potencia: z.number(),
  wifi: z.string(),
  senhaWifi: z.string(),
  neutraId: z.string(),
  portaId: z.string(),
});

/**
 * Esquema para atualização parcial de cliente
 */
export const atualizarClienteSchema = clienteSchema.partial();