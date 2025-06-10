// src/app/api/logs/schema.ts

import { z } from "zod";

/**
 * Esquema para validação de logs de auditoria
 * Define a estrutura de dados para registrar ações dos usuários no sistema
 */
export const logSchema = z.object({
  // Usuário que realizou a ação
  usuarioId: z.string().uuid(),
  
  // Tipo de ação realizada (Criação, Atualização, Exclusão, Visualização, etc.)
  acao: z.string(),
  
  // Entidade afetada (Usuário, Cidade, Caixa, Rota, etc.)
  entidade: z.string(),
  
  // ID da entidade afetada
  entidadeId: z.string().uuid(),
  
  // Detalhes adicionais sobre a ação (opcional)
  detalhes: z.record(z.any()).optional(),
});

/**
 * Esquema para filtrar logs de auditoria
 */
export const filtrarLogsSchema = z.object({
  // Termo de busca para filtrar logs
  busca: z.string().optional(),
  
  // Filtrar por usuário específico
  usuarioId: z.string().uuid().optional(),
  
  // Filtrar por tipo de ação
  acao: z.string().optional(),
  
  // Filtrar por tipo de entidade
  entidade: z.string().optional(),
  
  // Filtrar por ID de entidade específica
  entidadeId: z.string().uuid().optional(),
  
  // Filtrar por período - data inicial
  dataInicio: z.string().optional(),
  
  // Filtrar por período - data final
  dataFim: z.string().optional(),
  
  // Paginação - página atual
  pagina: z.number().int().positive().default(1),
  
  // Paginação - itens por página
  itensPorPagina: z.number().int().positive().default(10),
});