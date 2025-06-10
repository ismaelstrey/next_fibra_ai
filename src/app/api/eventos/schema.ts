// src/app/api/eventos/schema.ts

import { z } from "zod";

/**
 * Esquema para validação de eventos
 */
export const eventoSchema = z.object({
  // Título do evento
  titulo: z.string().min(3, "O título deve ter pelo menos 3 caracteres").max(100, "O título deve ter no máximo 100 caracteres"),
  
  // Descrição do evento
  descricao: z.string().min(5, "A descrição deve ter pelo menos 5 caracteres").max(1000, "A descrição deve ter no máximo 1000 caracteres"),
  
  // Data de início do evento
  dataInicio: z.string().refine((data) => {
    const date = new Date(data);
    return !isNaN(date.getTime());
  }, {
    message: "Data de início inválida",
  }),
  
  // Data de término do evento (opcional)
  dataFim: z.string().refine((data) => {
    const date = new Date(data);
    return !isNaN(date.getTime());
  }, {
    message: "Data de término inválida",
  }).optional(),
  
  // Tipo do evento
  tipo: z.enum(["manutencao", "instalacao", "visita", "reuniao", "outro"]),
  
  // Status do evento
  status: z.enum(["agendado", "em_andamento", "concluido", "cancelado"]),
  
  // Localização do evento (opcional)
  localizacao: z.string().max(200, "A localização deve ter no máximo 200 caracteres").optional(),
  
  // Cidade relacionada ao evento (opcional)
  cidadeId: z.string().uuid().optional(),
  
  // Caixa relacionada ao evento (opcional)
  caixaId: z.string().uuid().optional(),
  
  // Rota relacionada ao evento (opcional)
  rotaId: z.string().uuid().optional(),
  
  // Manutenção relacionada ao evento (opcional)
  manutencaoId: z.string().uuid().optional(),
  
  // Participantes do evento (opcional)
  participantes: z.array(z.string().uuid()).optional(),
}).refine(
  (data) => {
    // Se dataFim for fornecida, deve ser posterior à dataInicio
    if (data.dataFim) {
      const inicio = new Date(data.dataInicio);
      const fim = new Date(data.dataFim);
      return fim >= inicio;
    }
    return true;
  },
  {
    message: "A data de término deve ser posterior à data de início",
    path: ["dataFim"],
  }
);

/**
 * Esquema para atualização parcial de eventos
 */
export const atualizarEventoSchema = z.object({
  // Título do evento (opcional)
  titulo: z.string().min(3, "O título deve ter pelo menos 3 caracteres").max(100, "O título deve ter no máximo 100 caracteres").optional(),
  
  // Descrição do evento (opcional)
  descricao: z.string().min(5, "A descrição deve ter pelo menos 5 caracteres").max(1000, "A descrição deve ter no máximo 1000 caracteres").optional(),
  
  // Data de início do evento (opcional)
  dataInicio: z.string().refine((data) => {
    const date = new Date(data);
    return !isNaN(date.getTime());
  }, {
    message: "Data de início inválida",
  }).optional(),
  
  // Data de término do evento (opcional)
  dataFim: z.string().refine((data) => {
    const date = new Date(data);
    return !isNaN(date.getTime());
  }, {
    message: "Data de término inválida",
  }).optional(),
  
  // Tipo do evento (opcional)
  tipo: z.enum(["manutencao", "instalacao", "visita", "reuniao", "outro"]).optional(),
  
  // Status do evento (opcional)
  status: z.enum(["agendado", "em_andamento", "concluido", "cancelado"]).optional(),
  
  // Localização do evento (opcional)
  localizacao: z.string().max(200, "A localização deve ter no máximo 200 caracteres").optional(),
  
  // Cidade relacionada ao evento (opcional)
  cidadeId: z.string().uuid().optional(),
  
  // Caixa relacionada ao evento (opcional)
  caixaId: z.string().uuid().optional(),
  
  // Rota relacionada ao evento (opcional)
  rotaId: z.string().uuid().optional(),
  
  // Manutenção relacionada ao evento (opcional)
  manutencaoId: z.string().uuid().optional(),
  
  // Participantes do evento (opcional)
  participantes: z.array(z.string().uuid()).optional(),
}).refine(
  (data) => {
    // Se dataInicio e dataFim forem fornecidas, dataFim deve ser posterior à dataInicio
    if (data.dataInicio && data.dataFim) {
      const inicio = new Date(data.dataInicio);
      const fim = new Date(data.dataFim);
      return fim >= inicio;
    }
    return true;
  },
  {
    message: "A data de término deve ser posterior à data de início",
    path: ["dataFim"],
  }
);