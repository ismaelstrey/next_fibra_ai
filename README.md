# Fibra AI

## Regras e Padrões do Projeto

- Linguagem: TypeScript
- Framework: React (Next.js)
- ORM: Prisma
- Gerenciador de dependências: pnpm
- Gerenciamento de processos: PM2
- Controle de ambiente: dotenv
- Autenticação: JWT + bcrypt
- Documentação: Swagger (swagger-ui-express)
- Padronização: ESLint
- Estilização: Tailwind v4
- Organização: Arquitetura em camadas
- Estrutura de pastas: src/controllers, src/routes, src/services, src/repositories, src/middlewares, src/utils, src/validators, src/docs, src/server.ts
- Documentação de alterações: README.md
- Envio: GitHub
- Versão dos pacotes: Sempre a mais recente
- Animação: framer-motion
- Proteção de rotas: react-router-dom
- Tipagem: Sempre usar tipagem, nunca any
- Comentários: Sempre explicar funções em português BR
- Variáveis de ambiente: configurar no arquivo .env

## Como rodar o projeto

1. Instale as dependências:
   ```sh
   pnpm install
   ```
2. Copie o arquivo `.env.example` para `.env` e preencha as variáveis necessárias.
3. Execute as migrações do banco de dados:
   ```sh
   pnpm prisma migrate deploy
   ```
4. Gere o client Prisma:
   ```sh
   pnpm prisma generate
   ```
5. Rode o projeto em desenvolvimento:
   ```sh
   pnpm dev
   ```

## Estrutura de Pastas

- `src/controllers` — Lógica dos controladores
- `src/routes` — Definição das rotas
- `src/services` — Serviços de negócio
- `src/repositories` — Acesso a dados
- `src/middlewares` — Middlewares globais
- `src/utils` — Funções utilitárias
- `src/validators` — Schemas de validação
- `src/docs` — Documentação Swagger
- `src/server.ts` — Inicialização do servidor

## Outras informações

- Utilize sempre hooks para acesso à API.
- Siga o padrão camelCase para arquivos, funções e variáveis.
- Consulte o arquivo `roadmap.md` para detalhes das próximas etapas.
