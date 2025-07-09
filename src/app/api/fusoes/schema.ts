// src/app/api/fusoes/schema.ts

import { z } from "zod";

/**
 * Esquema para criação e atualização de fusão
 */
export const fusaoSchema = z.object({
  capilarOrigemId: z.string().min(1, "ID do capilar de origem é obrigatório"),
  capilarDestinoId: z.string().min(1, "ID do capilar de destino é obrigatório"),
  tipoFusao: z.enum(["capilar_capilar", "capilar_splitter", "splitter_cliente"], {
    errorMap: () => ({ message: "Tipo de fusão deve ser: capilar_capilar, capilar_splitter ou splitter_cliente" })
  }),
  status: z.enum(["Ativa", "Inativa", "Manutencao"], {
    errorMap: () => ({ message: "Status deve ser: Ativa, Inativa ou Manutencao" })
  }),
  qualidadeSinal: z.number().optional().nullable(),
  perdaInsercao: z.number().optional().nullable(),
  cor: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  caixaId: z.string().min(1, "ID da caixa é obrigatório"),
  bandejaId: z.string().optional().nullable(),
  posicaoFusao: z.number().int().min(1).optional().nullable(),
  criadoPorId: z.string().optional().nullable(),
});

/**
 * Esquema para atualização parcial de fusão
 */
export const atualizarFusaoSchema = fusaoSchema.partial();

/**
 * Esquema para criação em lote de fusões
 */
export const criarFusoesEmLoteSchema = z.object({
  fusoes: z.array(fusaoSchema),
});