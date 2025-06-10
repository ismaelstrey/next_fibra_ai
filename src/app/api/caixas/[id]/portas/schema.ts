// src/app/api/caixas/[id]/portas/schema.ts

import { z } from "zod";

/**
 * Esquema para atualização de uma porta
 */
export const atualizarPortaSchema = z.object({
  status: z.enum(["Livre", "Ocupada", "Reservada", "Defeito"], {
    errorMap: () => ({ message: "Status deve ser Livre, Ocupada, Reservada ou Defeito" })
  }),
  observacoes: z.string().optional().nullable(),
  clienteNome: z.string().optional().nullable(),
  clienteEndereco: z.string().optional().nullable(),
  clienteTelefone: z.string().optional().nullable(),
});

/**
 * Esquema para atualização em lote de portas
 */
export const atualizarPortasEmLoteSchema = z.object({
  portas: z.array(z.object({
    id: z.string(),
    status: z.enum(["Livre", "Ocupada", "Reservada", "Defeito"]).optional(),
    observacoes: z.string().optional().nullable(),
    clienteNome: z.string().optional().nullable(),
    clienteEndereco: z.string().optional().nullable(),
    clienteTelefone: z.string().optional().nullable(),
  })),
});