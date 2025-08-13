// src/docs/swagger-config.ts

/**
 * Configuração detalhada do Swagger para a API
 */
export const swaggerConfig = {
  openapi: "3.0.0",
  info: {
    title: "Fibra AI API",
    description: "API para gerenciamento de redes de fibra óptica",
    version: "1.0.0",
    contact: {
      name: "Equipe Fibra AI",
      email: "contato@fibraai.com",
      url: "https://fibraai.com",
    },
    license: {
      name: "Proprietário",
      url: "https://fibraai.com/licenca",
    },
  },
  servers: [
    {
      url: "/api",
      description: "Servidor de desenvolvimento",
    },
    {
      url: "https://api.fibraai.com/api",
      description: "Servidor de produção",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token JWT de autenticação",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          mensagem: {
            type: "string",
            description: "Mensagem de erro",
          },
          detalhes: {
            type: "object",
            description: "Detalhes adicionais do erro",
          },
        },
      },
      Usuario: {
        type: "object",
        required: ["nome", "email", "senha", "cargo"],
        properties: {
          id: {
            type: "string",
            description: "ID único do usuário",
          },
          nome: {
            type: "string",
            description: "Nome completo do usuário",
          },
          email: {
            type: "string",
            format: "email",
            description: "Email do usuário (único)",
          },
          senha: {
            type: "string",
            format: "password",
            description: "Senha do usuário (hash)",
          },
          cargo: {
            type: "string",
            enum: ["Gerente", "Técnico", "Operador"],
            description: "Cargo do usuário",
          },
          permissoes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                recurso: {
                  type: "string",
                  description: "Nome do recurso",
                },
                acoes: {
                  type: "array",
                  items: {
                    type: "string",
                    enum: ["ler", "criar", "atualizar", "excluir", "admin"],
                  },
                  description: "Ações permitidas no recurso",
                },
              },
            },
            description: "Permissões do usuário",
          },
          cidadesIds: {
            type: "array",
            items: {
              type: "string",
            },
            description: "IDs das cidades que o usuário tem acesso",
          },
          ativo: {
            type: "boolean",
            description: "Status do usuário",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Data de criação",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Data da última atualização",
          },
        },
      },
      Cidade: {
        type: "object",
        required: ["nome", "estado"],
        properties: {
          id: {
            type: "string",
            description: "ID único da cidade",
          },
          nome: {
            type: "string",
            description: "Nome da cidade",
          },
          estado: {
            type: "string",
            description: "Estado da cidade",
          },
          coordenadas: {
            type: "object",
            properties: {
              latitude: {
                type: "number",
                description: "Latitude da cidade",
              },
              longitude: {
                type: "number",
                description: "Longitude da cidade",
              },
            },
            description: "Coordenadas geográficas da cidade",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Data de criação",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Data da última atualização",
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: "Autenticação",
      description: "Operações relacionadas à autenticação",
    },
    {
      name: "Usuários",
      description: "Operações relacionadas a usuários",
    },
    {
      name: "Cidades",
      description: "Operações relacionadas a cidades",
    },
    {
      name: "Caixas",
      description: "Operações relacionadas a caixas de emenda",
    },
    {
      name: "Capilares",
      description: "Operações relacionadas a capilares",
    },
    {
      name: "Fusões",
      description: "Operações relacionadas a fusões",
    },
    {
      name: "Splitters",
      description: "Operações relacionadas a splitters",
    },
    {
      name: "Clientes",
      description: "Operações relacionadas a clientes",
    },
    {
      name: "Rotas",
      description: "Operações relacionadas a rotas",
    },
  ],
};