# Documentação da API Fibra AI

Este diretório contém a configuração e documentação da API do sistema Fibra AI usando Swagger/OpenAPI.

## Estrutura

- `swagger.ts`: Configuração principal do Swagger
- `README.md`: Este arquivo de documentação

## Como acessar a documentação

A documentação da API está disponível em:

- JSON: `/api/docs`
- UI: `/api/docs/ui`

## Como documentar novas rotas

Para documentar novas rotas da API, siga estas etapas:

1. Adicione anotações JSDoc com tags `@swagger` nos arquivos de rota
2. Defina os schemas dos modelos em `components.schemas`
3. Documente os endpoints com seus métodos, parâmetros e respostas

### Exemplo de documentação de modelo

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     NomeDoModelo:
 *       type: object
 *       required:
 *         - campoObrigatorio1
 *         - campoObrigatorio2
 *       properties:
 *         id:
 *           type: string
 *           description: ID único
 *         campoObrigatorio1:
 *           type: string
 *           description: Descrição do campo
 *         campoObrigatorio2:
 *           type: number
 *           description: Descrição do campo
 */
```

### Exemplo de documentação de endpoint

```typescript
/**
 * @swagger
 * /api/rota:
 *   get:
 *     summary: Breve descrição
 *     description: Descrição detalhada
 *     tags: [Categoria]
 *     parameters:
 *       - in: query
 *         name: parametro
 *         schema:
 *           type: string
 *         description: Descrição do parâmetro
 *     responses:
 *       200:
 *         description: Sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NomeDoModelo'
 */
```

## Tags comuns

Utilize estas tags para organizar a documentação:

- Usuários
- Cidades
- Rotas
- Caixas
- Fusões
- Splitters
- Tubos
- Capilares
- Manutenções
- Relatórios
- Configurações
- Autenticação

## Segurança

Todos os endpoints protegidos devem usar o esquema de segurança `bearerAuth`.

## Referências

- [Swagger JSDoc](https://github.com/Surnet/swagger-jsdoc/blob/master/docs/GETTING-STARTED.md)
- [OpenAPI 3.0 Specification](https://swagger.io/specification/)