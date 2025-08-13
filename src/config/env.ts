// src/config/env.ts

/**
 * Configurações do ambiente da aplicação
 * Centraliza todas as variáveis de ambiente em um único local
 */

// Configurações gerais da aplicação
export const APP_CONFIG = {
  // Nome da aplicação
  APP_NAME: process.env.APP_NAME || "Fibra AI",
  
  // URL base da aplicação
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  
  // Ambiente (development, production, test)
  NODE_ENV: process.env.NODE_ENV || "development",
  
  // Porta do servidor
  PORT: parseInt(process.env.PORT || "3000"),
  
  // Versão da API
  API_VERSION: process.env.API_VERSION || "v1",
};

// Configurações de autenticação
export const AUTH_CONFIG = {
  // Segredo para JWT e NextAuth
  JWT_SECRET: process.env.NEXTAUTH_SECRET,
  
  // Tempo de expiração do token JWT em segundos (padrão: 24 horas)
  JWT_EXPIRATION: parseInt(process.env.JWT_EXPIRATION || "86400"),
  
  // URL de callback do NextAuth
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
};

// Configurações de banco de dados
export const DATABASE_CONFIG = {
  // URL de conexão com o banco de dados
  DATABASE_URL: process.env.DATABASE_URL,
  
  // Tempo limite para operações de banco de dados em milissegundos
  DATABASE_TIMEOUT: parseInt(process.env.DATABASE_TIMEOUT || "30000"),
};

// Configurações de email
export const EMAIL_CONFIG = {
  // Servidor SMTP
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587"),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  
  // Email do remetente
  FROM_EMAIL: process.env.FROM_EMAIL || "noreply@fibraai.com",
  FROM_NAME: process.env.FROM_NAME || "Fibra AI",
};

// Configurações de armazenamento
export const STORAGE_CONFIG = {
  // Tipo de armazenamento (local, s3, etc.)
  STORAGE_TYPE: process.env.STORAGE_TYPE || "local",
  
  // Configurações do S3 (se aplicável)
  S3_BUCKET: process.env.S3_BUCKET,
  S3_REGION: process.env.S3_REGION,
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
  S3_SECRET_KEY: process.env.S3_SECRET_KEY,
  
  // Pasta local para armazenamento de arquivos
  UPLOAD_DIR: process.env.UPLOAD_DIR || "./uploads",
};

// Configurações de logs
export const LOG_CONFIG = {
  // Nível de log (debug, info, warn, error)
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  
  // Formato do log (json, text)
  LOG_FORMAT: process.env.LOG_FORMAT || "json",
  
  // Destino do log (console, file, both)
  LOG_DESTINATION: process.env.LOG_DESTINATION || "console",
  
  // Arquivo de log (se aplicável)
  LOG_FILE: process.env.LOG_FILE || "./logs/app.log",
};

// Configurações de segurança
export const SECURITY_CONFIG = {
  // Habilitar CORS
  CORS_ENABLED: process.env.CORS_ENABLED === "true",
  
  // Origens permitidas para CORS
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(",") || ["*"],
  
  // Limite de requisições por IP
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || "100"),
  
  // Janela de tempo para limite de requisições em milissegundos
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || "60000"),
};