// src/app/api/rotas/schema.ts

import { z } from "zod";

/**
 * Esquema para validação de coordenadas geográficas
 */
const coordenadaSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

/**
 * Esquema para criação e atualização de rota
 */
export const rotaSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  tipoCabo: z.string(),
  fabricante: z.string().optional().nullable(),
  distancia: z.number().optional().nullable(),
  profundidade: z.number().optional().nullable(),
  tipoPassagem: z.enum(["Posteado", "Subterrâneo", "Aéreo"]),
  coordenadas: z.array(coordenadaSchema).min(2, "Uma rota deve ter pelo menos 2 pontos"),
  cor: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  cidadeId: z.string(),
});

/**
 * Esquema para atualização parcial de rota
 */
export const atualizarRotaSchema = rotaSchema.partial();