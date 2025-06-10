// src/app/api/relatorios/schema.ts

import { z } from "zod";

/**
 * Esquema para validação de relatórios
 */
export const relatorioSchema = z.object({
  // Título do relatório
  titulo: z.string().min(3, "O título deve ter pelo menos 3 caracteres").max(100, "O título deve ter no máximo 100 caracteres"),
  
  // Descrição do relatório
  descricao: z.string().min(5, "A descrição deve ter pelo menos 5 caracteres").max(1000, "A descrição deve ter no máximo 1000 caracteres"),
  
  // Tipo do relatório
  tipo: z.enum(["manutencao", "instalacao", "desempenho", "incidente", "outro"]),
  
  // Período do relatório - data inicial
  dataInicio: z.string().refine((data) => {
    const date = new Date(data);
    return !isNaN(date.getTime());
  }, {
    message: "Data de início inválida",
  }),
  
  // Período do relatório - data final
  dataFim: z.string().refine((data) => {
    const date = new Date(data);
    return !isNaN(date.getTime());
  }, {
    message: "Data de término inválida",
  }),
  
  // Dados do relatório (JSON)
  dados: z.record(z.any()).optional(),
  
  // Cidade relacionada ao relatório (opcional)
  cidadeId: z.string().uuid().optional(),
  
  // Caixa relacionada ao relatório (opcional)
  caixaId: z.string().uuid().optional(),
  
  // Rota relacionada ao relatório (opcional)
  rotaId: z.string().uuid().optional(),
  
  // Manutenção relacionada ao relatório (opcional)
  manutencaoId: z.string().uuid().optional(),
  
  // Observações adicionais (opcional)
  observacoes: z.string().max(2000, "As observações devem ter no máximo 2000 caracteres").optional(),
}).refine(
  (data) => {
    // A data de fim deve ser posterior à data de início
    const inicio = new Date(data.dataInicio);
    const fim = new Date(data.dataFim);
    return fim >= inicio;
  },
  {
    message: "A data de término deve ser posterior à data de início",
    path: ["dataFim"],
  }
);

/**
 * Esquema para atualização parcial de relatórios
 */
export const atualizarRelatorioSchema = z.object({
  // Título do relatório (opcional)
  titulo: z.string().min(3, "O título deve ter pelo menos 3 caracteres").max(100, "O título deve ter no máximo 100 caracteres").optional(),
  
  // Descrição do relatório (opcional)
  descricao: z.string().min(5, "A descrição deve ter pelo menos 5 caracteres").max(1000, "A descrição deve ter no máximo 1000 caracteres").optional(),
  
  // Tipo do relatório (opcional)
  tipo: z.enum(["manutencao", "instalacao", "desempenho", "incidente", "outro"]).optional(),
  
  // Período do relatório - data inicial (opcional)
  dataInicio: z.string().refine((data) => {
    const date = new Date(data);
    return !isNaN(date.getTime());
  }, {
    message: "Data de início inválida",
  }).optional(),
  
  // Período do relatório - data final (opcional)
  dataFim: z.string().refine((data) => {
    const date = new Date(data);
    return !isNaN(date.getTime());
  }, {
    message: "Data de término inválida",
  }).optional(),
  
  // Dados do relatório (JSON) (opcional)
  dados: z.record(z.any()).optional(),
  
  // Cidade relacionada ao relatório (opcional)
  cidadeId: z.string().uuid().optional(),
  
  // Caixa relacionada ao relatório (opcional)
  caixaId: z.string().uuid().optional(),
  
  // Rota relacionada ao relatório (opcional)
  rotaId: z.string().uuid().optional(),
  
  // Manutenção relacionada ao relatório (opcional)
  manutencaoId: z.string().uuid().optional(),
  
  // Observações adicionais (opcional)
  observacoes: z.string().max(2000, "As observações devem ter no máximo 2000 caracteres").optional(),
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