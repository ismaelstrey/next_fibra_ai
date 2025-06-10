// src/app/api/configuracoes/schema.ts

import { z } from "zod";

/**
 * Esquema para validação de configurações do sistema
 * Define a estrutura de dados para configurações globais
 */
export const configuracaoGlobalSchema = z.object({
  // Chave única da configuração
  chave: z.string().min(1, "A chave é obrigatória"),
  
  // Valor da configuração (pode ser qualquer tipo de dado)
  valor: z.any(),
  
  // Descrição da configuração (opcional)
  descricao: z.string().optional(),
  
  // Categoria da configuração para agrupamento
  categoria: z.string().default("geral"),
  
  // Indica se a configuração é editável pelos usuários
  editavel: z.boolean().default(true),
});

/**
 * Esquema para validação de configurações de usuário
 * Define a estrutura de dados para preferências individuais
 */
export const configuracaoUsuarioSchema = z.object({
  // ID do usuário dono da configuração
  usuarioId: z.string().uuid(),
  
  // Chave única da configuração
  chave: z.string().min(1, "A chave é obrigatória"),
  
  // Valor da configuração (pode ser qualquer tipo de dado)
  valor: z.any(),
});

/**
 * Esquema para atualização de configurações globais
 */
export const atualizarConfiguracaoGlobalSchema = z.object({
  // Valor da configuração (pode ser qualquer tipo de dado)
  valor: z.any(),
  
  // Descrição da configuração (opcional)
  descricao: z.string().optional(),
  
  // Categoria da configuração para agrupamento
  categoria: z.string().optional(),
  
  // Indica se a configuração é editável pelos usuários
  editavel: z.boolean().optional(),
});

/**
 * Esquema para atualização de configurações de usuário
 */
export const atualizarConfiguracaoUsuarioSchema = z.object({
  // Valor da configuração (pode ser qualquer tipo de dado)
  valor: z.any(),
});