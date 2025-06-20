// src/app/api/incidentes/schema.ts

import { z } from "zod";

/**
 * Esquema para validação de criação de incidente
 */
export const incidenteSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  dataOcorrencia: z.string().refine((data) => {
    const date = new Date(data);
    return !isNaN(date.getTime());
  }, {
    message: "Data de ocorrência inválida",
  }),
  dataResolucao: z.string().optional().nullable().refine((data) => {
    if (!data) return true;
    const date = new Date(data);
    return !isNaN(date.getTime());
  }, {
    message: "Data de resolução inválida",
  }),
  status: z.enum(["Aberto", "Em análise", "Em resolução", "Resolvido", "Fechado"]),
  prioridade: z.enum(["Baixa", "Média", "Alta", "Crítica"]),
  impacto: z.enum(["Baixo", "Médio", "Alto", "Crítico"]),
  solucao: z.string().optional().nullable(),
  caixaId: z.string().uuid("ID da caixa inválido").optional(),
  capilarId: z.string().uuid("ID do capilar inválido").optional(),
  emendaId: z.string().uuid("ID da emenda inválido").optional(),
  clienteId: z.string().uuid("ID do cliente inválido").optional(),
  equipamentoId: z.string().uuid("ID do equipamento inválido").optional(),
}).refine(
  (data) => {
    // Pelo menos um dos IDs deve ser fornecido
    return !!data.caixaId || !!data.capilarId || !!data.emendaId || !!data.clienteId || !!data.equipamentoId;
  },
  {
    message: "Pelo menos um ID de entidade (caixaId, capilarId, emendaId, clienteId ou equipamentoId) deve ser fornecido",
    path: ["caixaId"],
  }
);

/**
 * Esquema para validação de atualização parcial de incidente
 */
export const atualizarIncidenteSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório").optional(),
  descricao: z.string().min(1, "Descrição é obrigatória").optional(),
  dataOcorrencia: z.string().optional().refine((data) => {
    if (!data) return true;
    const date = new Date(data);
    return !isNaN(date.getTime());
  }, {
    message: "Data de ocorrência inválida",
  }),
  dataResolucao: z.string().optional().nullable().refine((data) => {
    if (!data) return true;
    const date = new Date(data);
    return !isNaN(date.getTime());
  }, {
    message: "Data de resolução inválida",
  }),
  status: z.enum(["Aberto", "Em análise", "Em resolução", "Resolvido", "Fechado"]).optional(),
  prioridade: z.enum(["Baixa", "Média", "Alta", "Crítica"]).optional(),
  impacto: z.enum(["Baixo", "Médio", "Alto", "Crítico"]).optional(),
  solucao: z.string().optional().nullable(),
  caixaId: z.string().uuid("ID da caixa inválido").optional(),
  capilarId: z.string().uuid("ID do capilar inválido").optional(),
  emendaId: z.string().uuid("ID da emenda inválido").optional(),
  clienteId: z.string().uuid("ID do cliente inválido").optional(),
  equipamentoId: z.string().uuid("ID do equipamento inválido").optional(),
});