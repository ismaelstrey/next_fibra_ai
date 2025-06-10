// src/app/api/comentarios/schema.ts

import { z } from "zod";

/**
 * Esquema para criação de comentário
 */
export const comentarioSchema = z.object({
  conteudo: z.string().min(3, "Comentário deve ter pelo menos 3 caracteres"),
  caixaId: z.string().optional(),
  rotaId: z.string().optional(),
}).refine(
  data => data.caixaId || data.rotaId,
  {
    message: "Deve ser especificado pelo menos uma caixa ou uma rota",
    path: ["caixaId"],
  }
);

/**
 * Esquema para atualização de comentário
 */
export const atualizarComentarioSchema = z.object({
  conteudo: z.string().min(3, "Comentário deve ter pelo menos 3 caracteres"),
});