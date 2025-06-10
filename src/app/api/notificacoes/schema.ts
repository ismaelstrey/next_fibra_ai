// src/app/api/notificacoes/schema.ts

import { z } from "zod";

/**
 * Esquema para validação de notificações
 */
export const notificacaoSchema = z.object({
  // Título da notificação
  titulo: z.string().min(3, "O título deve ter pelo menos 3 caracteres").max(100, "O título deve ter no máximo 100 caracteres"),
  
  // Conteúdo da notificação
  conteudo: z.string().min(5, "O conteúdo deve ter pelo menos 5 caracteres").max(500, "O conteúdo deve ter no máximo 500 caracteres"),
  
  // Tipo da notificação (informação, alerta, erro)
  tipo: z.enum(["informacao", "alerta", "erro"]),
  
  // Nível de prioridade da notificação
  prioridade: z.enum(["baixa", "media", "alta"]),
  
  // Destinatários da notificação (opcional)
  destinatarios: z.array(z.string().uuid()).optional(),
  
  // Cargos dos destinatários (opcional)
  cargoDestinatarios: z.array(z.enum(["Técnico", "Engenheiro", "Gerente"])).optional(),
  
  // Cidade relacionada à notificação (opcional)
  cidadeId: z.string().uuid().optional(),
  
  // Caixa relacionada à notificação (opcional)
  caixaId: z.string().uuid().optional(),
  
  // Rota relacionada à notificação (opcional)
  rotaId: z.string().uuid().optional(),
  
  // Manutenção relacionada à notificação (opcional)
  manutencaoId: z.string().uuid().optional(),
}).refine(
  (data) => {
    // Pelo menos um dos campos de destinatários deve estar preenchido
    return data.destinatarios?.length || data.cargoDestinatarios?.length;
  },
  {
    message: "Pelo menos um destinatário ou cargo de destinatário deve ser especificado",
    path: ["destinatarios"],
  }
);

/**
 * Esquema para atualização parcial de notificações
 */
export const atualizarNotificacaoSchema = z.object({
  // Título da notificação (opcional)
  titulo: z.string().min(3, "O título deve ter pelo menos 3 caracteres").max(100, "O título deve ter no máximo 100 caracteres").optional(),
  
  // Conteúdo da notificação (opcional)
  conteudo: z.string().min(5, "O conteúdo deve ter pelo menos 5 caracteres").max(500, "O conteúdo deve ter no máximo 500 caracteres").optional(),
  
  // Tipo da notificação (opcional)
  tipo: z.enum(["informacao", "alerta", "erro"]).optional(),
  
  // Nível de prioridade da notificação (opcional)
  prioridade: z.enum(["baixa", "media", "alta"]).optional(),
  
  // Status da notificação (opcional)
  lida: z.boolean().optional(),
});

/**
 * Esquema para marcar notificação como lida
 */
export const marcarNotificacaoSchema = z.object({
  lida: z.boolean(),
});