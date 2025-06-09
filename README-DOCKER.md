# Configuração do Ambiente Docker para Next-Fibra

Este documento contém instruções para configurar e executar o ambiente de banco de dados PostgreSQL usando Docker para o projeto Next-Fibra.

## Pré-requisitos

- Docker instalado (https://www.docker.com/get-started)
- Docker Compose instalado (geralmente vem com o Docker Desktop)

## Estrutura de Arquivos

- `docker-compose.yml`: Configuração dos serviços Docker (PostgreSQL e pgAdmin)
- `.env.docker`: Variáveis de ambiente configuradas para o ambiente Docker

## Serviços Configurados

1. **PostgreSQL**
   - Porta: 51214 (principal) e 51215 (shadow database para Prisma)
   - Usuário: postgres
   - Senha: postgres
   - Banco de dados: template1

2. **pgAdmin** (interface web para gerenciamento do PostgreSQL)
   - URL: http://localhost:5050
   - Email: admin@fibra.local
   - Senha: admin

## Como Iniciar os Serviços

1. Abra um terminal na pasta raiz do projeto (onde está o arquivo `docker-compose.yml`)

2. Execute o comando para iniciar os serviços:

   ```bash
   docker-compose up -d
   ```

3. Para verificar se os serviços estão rodando:

   ```bash
   docker-compose ps
   ```

## Como Usar o Ambiente Docker

1. **Copie o arquivo .env.docker para .env**:

   ```bash
   copy .env.docker .env
   ```

2. **Execute as migrações do Prisma**:

   ```bash
   npx prisma migrate dev
   ```

3. **Acesse o pgAdmin** para gerenciar o banco de dados:
   - Abra http://localhost:5050 no navegador
   - Faça login com as credenciais mencionadas acima
   - Adicione um novo servidor com as seguintes configurações:
     - Nome: next-fibra
     - Host: postgres (nome do serviço no docker-compose)
     - Porta: 5432
     - Usuário: postgres
     - Senha: postgres

## Como Parar os Serviços

```bash
docker-compose down
```

Para remover também os volumes (dados do banco):

```bash
docker-compose down -v
```

## Solução de Problemas

1. **Erro de conexão com o banco de dados**:
   - Verifique se os serviços Docker estão rodando
   - Confirme se as portas 51214 e 51215 não estão sendo usadas por outros serviços

2. **Erro ao executar migrações do Prisma**:
   - Verifique se a URL do banco de dados no arquivo `.env` está correta
   - Tente reiniciar os serviços Docker

3. **Não consegue acessar o pgAdmin**:
   - Verifique se o serviço está rodando com `docker-compose ps`
   - Tente reiniciar o serviço com `docker-compose restart pgadmin`