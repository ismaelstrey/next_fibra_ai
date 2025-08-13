// src/docs/swagger.ts

import { createSwaggerSpec } from 'next-swagger-doc';
import { swaggerConfig } from './swagger-config';

/**
 * Configuração do Swagger para a API
 */
export const swaggerSpec = createSwaggerSpec({
  apiFolder: './src/app/api', // Pasta onde estão as rotas da API
  definition: swaggerConfig,
});

/**
 * Handler para servir a especificação do Swagger
 */
export function getSwaggerJSON() {
  return swaggerSpec;
}

/**
 * Handler para servir a UI do Swagger
 */
export function getSwaggerUI(swaggerUrl: string) {
  return {
    url: swaggerUrl,
    // Configurações adicionais para a UI do Swagger
    docExpansion: 'list', // Expande as operações por padrão
    deepLinking: true, // Permite links diretos para operações específicas
    persistAuthorization: true, // Mantém a autorização entre recarregamentos
    displayOperationId: false, // Não exibe o ID da operação
    defaultModelsExpandDepth: 1, // Profundidade de expansão dos modelos
    defaultModelExpandDepth: 1, // Profundidade de expansão do modelo padrão
    showExtensions: false, // Não exibe extensões
    showCommonExtensions: false, // Não exibe extensões comuns
  };
}