// src/app/api/estatisticas/schema.ts

import { z } from "zod";

/**
 * Esquema para validação de parâmetros de consulta de estatísticas
 */
export const consultaEstatisticasSchema = z.object({
  // Tipo de estatística a ser consultada
  tipo: z.enum([
    "manutencoes", // Estatísticas de manutenções
    "caixas", // Estatísticas de caixas
    "rotas", // Estatísticas de rotas
    "usuarios", // Estatísticas de usuários
    "cidades", // Estatísticas de cidades
    "eventos", // Estatísticas de eventos
    "atividade", // Estatísticas de atividade do sistema
  ]),
  
  // Período de início para filtrar estatísticas
  dataInicio: z.string().optional(),
  
  // Período de fim para filtrar estatísticas
  dataFim: z.string().optional(),
  
  // ID da cidade para filtrar estatísticas
  cidadeId: z.string().uuid().optional(),
  
  // ID do usuário para filtrar estatísticas
  usuarioId: z.string().uuid().optional(),
  
  // Agrupar por (dia, semana, mes, ano)
  agruparPor: z.enum(["dia", "semana", "mes", "ano"]).default("mes"),
});

/**
 * Esquema para validação de registro de atividade
 */
export const registroAtividadeSchema = z.object({
  // Usuário que realizou a atividade
  usuarioId: z.string().uuid(),
  
  // Tipo de atividade (login, logout, visualização, etc.)
  tipo: z.string(),
  
  // Entidade relacionada à atividade (opcional)
  entidade: z.string().optional(),
  
  // ID da entidade relacionada (opcional)
  entidadeId: z.string().uuid().optional(),
  
  // Detalhes adicionais sobre a atividade (opcional)
  detalhes: z.record(z.any()).optional(),
});