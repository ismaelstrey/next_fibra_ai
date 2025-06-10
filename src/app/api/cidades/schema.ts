// src/app/api/cidades/schema.ts

import { z } from "zod";

/**
 * Esquema para validação de coordenadas geográficas
 */
const coordenadasSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

/**
 * Esquema para criação e atualização de cidade
 */
export const cidadeSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  estado: z.string().length(2, "Estado deve ser a sigla com 2 caracteres"),
  coordenadas: coordenadasSchema.optional().nullable(),
});

/**
 * Esquema para atualização parcial de cidade
 */
export const atualizarCidadeSchema = cidadeSchema.partial();

/**
 * Esquema para associação de usuários a uma cidade
 */
export const usuariosCidadeSchema = z.object({
  usuarioIds: z.array(z.string()),
});