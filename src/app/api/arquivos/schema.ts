// src/app/api/arquivos/schema.ts

import { z } from "zod";

/**
 * Esquema para validação de criação de arquivo
 */
export const arquivoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.string().min(1, "Tipo é obrigatório"),
  url: z.string().url("URL inválida"),
  tamanho: z.number().int().positive("Tamanho deve ser um número positivo"),
  caixaId: z.string().uuid("ID da caixa inválido").optional(),
  capilarId: z.string().uuid("ID do capilar inválido").optional(),
  emendaId: z.string().uuid("ID da emenda inválido").optional(),
  clienteId: z.string().uuid("ID do cliente inválido").optional(),
}).refine(
  (data) => {
    // Pelo menos um dos IDs deve ser fornecido
    return !!data.caixaId || !!data.capilarId || !!data.emendaId || !!data.clienteId;
  },
  {
    message: "Pelo menos um ID de entidade (caixaId, capilarId, emendaId ou clienteId) deve ser fornecido",
    path: ["caixaId"],
  }
);

/**
 * Esquema para validação de atualização parcial de arquivo
 */
export const atualizarArquivoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").optional(),
  tipo: z.string().min(1, "Tipo é obrigatório").optional(),
  url: z.string().url("URL inválida").optional(),
  tamanho: z.number().int().positive("Tamanho deve ser um número positivo").optional(),
});