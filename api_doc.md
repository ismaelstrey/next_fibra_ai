# Documentação da API FibraAI

Esta documentação descreve os endpoints da API do sistema FibraAI, incluindo métodos, parâmetros e respostas.

## Índice

- [Autenticação](#autenticação)
- [Registro](#registro)
- [Usuários](#usuários)
- [Cidades](#cidades)
- [Rotas](#rotas)
- [Caixas](#caixas)
  - [Portas](#portas)
  - [Bandejas](#bandejas)
- [Fusões](#fusões)
- [Splitters](#splitters)
- [Clientes](#clientes)
- [Incidentes](#incidentes)
- [Relatórios](#relatórios)
- [Comentários](#comentários)
- [Manutenções](#manutenções)
- [Logs](#logs)

## Autenticação

### POST /api/auth/[...nextauth]

Autenticação de usuários utilizando NextAuth.

**Parâmetros:**

```json
{
  "email": "usuario@exemplo.com",
  "senha": "senha123"
}
```

**Resposta:**

Retorna um token JWT e informações do usuário autenticado.

```json
{
  "user": {
    "id": "uuid",
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "image": "url_da_imagem",
    "cargo": "Técnico|Engenheiro|Gerente"
  },
  "expires": "data_expiração"
}
```

## Registro

### POST /api/registro

Registra um novo usuário no sistema.

**Parâmetros:**

```json
{
  "nome": "Nome do Usuário",
  "email": "usuario@exemplo.com",
  "senha": "senha123",
  "confirmarSenha": "senha123"
}
```

**Resposta:**

```json
{
  "mensagem": "Usuário registrado com sucesso",
  "usuario": {
    "id": "uuid",
    "nome": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "cargo": "Técnico",
    "criadoEm": "data_criacao"
  }
}
```

## Usuários

### GET /api/usuarios

Lista todos os usuários com paginação e filtros. Requer cargo de Gerente.

**Parâmetros de consulta:**

- `pagina`: Número da página (padrão: 1)
- `limite`: Quantidade de itens por página (padrão: 10)
- `busca`: Termo para busca por nome ou email
- `cargo`: Filtro por cargo (Técnico, Engenheiro, Gerente)

**Resposta:**

```json
{
  "usuarios": [
    {
      "id": "uuid",
      "nome": "Nome do Usuário",
      "email": "usuario@exemplo.com",
      "cargo": "Técnico|Engenheiro|Gerente",
      "imagem": "url_da_imagem",
      "criadoEm": "data_criacao",
      "atualizadoEm": "data_atualizacao",
      "_count": {
        "cidades": 0,
        "logs": 0,
        "comentarios": 0
      }
    }
  ],
  "paginacao": {
    "total": 100,
    "pagina": 1,
    "limite": 10,
    "totalPaginas": 10
  }
}
```

### POST /api/usuarios

Cria um novo usuário. Requer cargo de Gerente.

**Parâmetros:**

```json
{
  "nome": "Nome do Usuário",
  "email": "usuario@exemplo.com",
  "senha": "senha123",
  "confirmarSenha": "senha123",
  "cargo": "Técnico|Engenheiro|Gerente",
  "imagem": "url_da_imagem" // opcional
}
```

**Resposta:**

```json
{
  "mensagem": "Usuário criado com sucesso",
  "usuario": {
    "id": "uuid",
    "nome": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "cargo": "Técnico|Engenheiro|Gerente",
    "imagem": "url_da_imagem",
    "criadoEm": "data_criacao",
    "atualizadoEm": "data_atualizacao"
  }
}
```

### GET /api/usuarios/[id]

Obtém detalhes de um usuário específico. Requer cargo de Gerente ou ser o próprio usuário.

**Resposta:**

```json
{
  "usuario": {
    "id": "uuid",
    "nome": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "cargo": "Técnico|Engenheiro|Gerente",
    "imagem": "url_da_imagem",
    "criadoEm": "data_criacao",
    "atualizadoEm": "data_atualizacao",
    "cidades": [
      {
        "id": "uuid",
        "nome": "Nome da Cidade",
        "estado": "UF"
      }
    ]
  }
}
```

### PATCH /api/usuarios/[id]

Atualiza um usuário específico. Requer cargo de Gerente ou ser o próprio usuário.

**Parâmetros:**

```json
{
  "nome": "Novo Nome", // opcional
  "email": "novo@exemplo.com", // opcional
  "cargo": "Técnico|Engenheiro|Gerente", // opcional, apenas Gerentes podem alterar
  "imagem": "nova_url_da_imagem", // opcional
  "senha": "nova_senha", // opcional
  "confirmarSenha": "nova_senha", // obrigatório se senha for fornecida
  "senhaAtual": "senha_atual" // obrigatório se senha for fornecida
}
```

**Resposta:**

```json
{
  "mensagem": "Usuário atualizado com sucesso",
  "usuario": {
    "id": "uuid",
    "nome": "Novo Nome",
    "email": "novo@exemplo.com",
    "cargo": "Técnico|Engenheiro|Gerente",
    "imagem": "nova_url_da_imagem",
    "atualizadoEm": "data_atualizacao"
  }
}
```

## Cidades

### GET /api/cidades

Lista todas as cidades com paginação e filtros.

**Parâmetros de consulta:**

- `pagina`: Número da página (padrão: 1)
- `limite`: Quantidade de itens por página (padrão: 10)
- `busca`: Termo para busca por nome
- `estado`: Filtro por estado (UF)
- `apenasMinhas`: Se "true", mostra apenas cidades associadas ao usuário

**Resposta:**

```json
{
  "cidades": [
    {
      "id": "uuid",
      "nome": "Nome da Cidade",
      "estado": "UF",
      "coordenadas": {
        "lat": 0,
        "lng": 0
      },
      "criadoEm": "data_criacao",
      "atualizadoEm": "data_atualizacao",
      "_count": {
        "usuarios": 0,
        "rotas": 0,
        "caixas": 0
      }
    }
  ],
  "paginacao": {
    "total": 100,
    "pagina": 1,
    "limite": 10,
    "totalPaginas": 10
  }
}
```

### POST /api/cidades

Cria uma nova cidade. Requer cargo de Gerente.

**Parâmetros:**

```json
{
  "nome": "Nome da Cidade",
  "estado": "UF",
  "coordenadas": {
    "lat": 0,
    "lng": 0
  }
}
```

**Resposta:**

```json
{
  "mensagem": "Cidade criada com sucesso",
  "cidade": {
    "id": "uuid",
    "nome": "Nome da Cidade",
    "estado": "UF",
    "coordenadas": {
      "lat": 0,
      "lng": 0
    },
    "criadoEm": "data_criacao",
    "atualizadoEm": "data_atualizacao"
  }
}
```

### GET /api/cidades/[id]

Obtém detalhes de uma cidade específica.

**Resposta:**

```json
{
  "cidade": {
    "id": "uuid",
    "nome": "Nome da Cidade",
    "estado": "UF",
    "coordenadas": {
      "lat": 0,
      "lng": 0
    },
    "criadoEm": "data_criacao",
    "atualizadoEm": "data_atualizacao",
    "usuarios": [
      {
        "id": "uuid",
        "nome": "Nome do Usuário"
      }
    ],
    "_count": {
      "rotas": 0,
      "caixas": 0
    }
  }
}
```

### PATCH /api/cidades/[id]

Atualiza uma cidade específica. Requer cargo de Gerente.

**Parâmetros:**

```json
{
  "nome": "Novo Nome", // opcional
  "estado": "UF", // opcional
  "coordenadas": { // opcional
    "lat": 0,
    "lng": 0
  }
}
```

**Resposta:**

```json
{
  "mensagem": "Cidade atualizada com sucesso",
  "cidade": {
    "id": "uuid",
    "nome": "Novo Nome",
    "estado": "UF",
    "coordenadas": {
      "lat": 0,
      "lng": 0
    },
    "atualizadoEm": "data_atualizacao"
  }
}
```

## Rotas

### GET /api/rotas

Lista todas as rotas com paginação e filtros.

**Parâmetros de consulta:**

- `pagina`: Número da página (padrão: 1)
- `limite`: Quantidade de itens por página (padrão: 10)
- `busca`: Termo para busca por nome
- `cidadeId`: Filtro por cidade
- `tipoCabo`: Filtro por tipo de cabo
- `tipoPassagem`: Filtro por tipo de passagem (Posteado, Subterrâneo, Aéreo)

**Resposta:**

```json
{
  "rotas": [
    {
      "id": "uuid",
      "nome": "Nome da Rota",
      "tipoCabo": "Tipo do Cabo",
      "fabricante": "Fabricante",
      "distancia": 0,
      "profundidade": 0,
      "tipoPassagem": "Posteado|Subterrâneo|Aéreo",
      "cor": "#RRGGBB",
      "observacoes": "Observações",
      "criadoEm": "data_criacao",
      "atualizadoEm": "data_atualizacao",
      "cidadeId": "uuid",
      "cidade": {
        "nome": "Nome da Cidade",
        "estado": "UF"
      },
      "_count": {
        "caixas": 0,
        "fusoes": 0,
        "comentarios": 0,
        "arquivos": 0
      }
    }
  ],
  "paginacao": {
    "total": 100,
    "pagina": 1,
    "limite": 10,
    "totalPaginas": 10
  }
}
```

### POST /api/rotas

Cria uma nova rota. Requer cargo de Engenheiro ou Gerente.

**Parâmetros:**

```json
{
  "nome": "Nome da Rota",
  "tipoCabo": "Tipo do Cabo",
  "fabricante": "Fabricante", // opcional
  "distancia": 0, // opcional
  "profundidade": 0, // opcional
  "tipoPassagem": "Posteado|Subterrâneo|Aéreo",
  "coordenadas": [
    { "lat": 0, "lng": 0 },
    { "lat": 0, "lng": 0 }
  ],
  "cor": "#RRGGBB", // opcional
  "observacoes": "Observações", // opcional
  "cidadeId": "uuid"
}
```

**Resposta:**

```json
{
  "mensagem": "Rota criada com sucesso",
  "rota": {
    "id": "uuid",
    "nome": "Nome da Rota",
    "tipoCabo": "Tipo do Cabo",
    "fabricante": "Fabricante",
    "distancia": 0,
    "profundidade": 0,
    "tipoPassagem": "Posteado|Subterrâneo|Aéreo",
    "coordenadas": [
      { "lat": 0, "lng": 0 },
      { "lat": 0, "lng": 0 }
    ],
    "cor": "#RRGGBB",
    "observacoes": "Observações",
    "cidadeId": "uuid",
    "criadoEm": "data_criacao",
    "atualizadoEm": "data_atualizacao"
  }
}
```

## Caixas

### GET /api/caixas

Lista todas as caixas com paginação e filtros.

**Parâmetros de consulta:**

- `pagina`: Número da página (padrão: 1)
- `limite`: Quantidade de itens por página (padrão: 10)
- `busca`: Termo para busca por nome
- `cidadeId`: Filtro por cidade
- `rotaId`: Filtro por rota
- `tipo`: Filtro por tipo (CTO, CEO)

**Resposta:**

```json
{
  "caixas": [
    {
      "id": "uuid",
      "nome": "Nome da Caixa",
      "tipo": "CTO|CEO",
      "modelo": "Modelo da Caixa",
      "capacidade": 0,
      "coordenadas": {
        "latitude": 0,
        "longitude": 0
      },
      "observacoes": "Observações",
      "criadoEm": "data_criacao",
      "atualizadoEm": "data_atualizacao",
      "cidadeId": "uuid",
      "rotaId": "uuid",
      "cidade": {
        "nome": "Nome da Cidade",
        "estado": "UF"
      },
      "rota": {
        "nome": "Nome da Rota"
      },
      "_count": {
        "fusoes": 0,
        "portas": 0
      }
    }
  ],
  "paginacao": {
    "total": 100,
    "pagina": 1,
    "limite": 10,
    "totalPaginas": 10
  }
}
```

### POST /api/caixas

Cria uma nova caixa. Requer cargo de Engenheiro ou Gerente.

**Parâmetros:**

```json
{
  "nome": "Nome da Caixa",
  "tipo": "CTO|CEO",
  "modelo": "Modelo da Caixa",
  "capacidade": 0,
  "coordenadas": {
    "latitude": 0,
    "longitude": 0
  },
  "observacoes": "Observações", // opcional
  "cidadeId": "uuid",
  "rotaId": "uuid"
}
```

**Resposta:**

```json
{
  "mensagem": "Caixa criada com sucesso",
  "caixa": {
    "id": "uuid",
    "nome": "Nome da Caixa",
    "tipo": "CTO|CEO",
    "modelo": "Modelo da Caixa",
    "capacidade": 0,
    "coordenadas": {
      "latitude": 0,
      "longitude": 0
    },
    "observacoes": "Observações",
    "cidadeId": "uuid",
    "rotaId": "uuid",
    "criadoEm": "data_criacao",
    "atualizadoEm": "data_atualizacao"
  }
}
```

### GET /api/caixas/[id]

Obtém detalhes de uma caixa específica.

**Resposta:**

```json
{
  "caixa": {
    "id": "uuid",
    "nome": "Nome da Caixa",
    "tipo": "CTO|CEO",
    "modelo": "Modelo da Caixa",
    "capacidade": 0,
    "coordenadas": {
      "latitude": 0,
      "longitude": 0
    },
    "observacoes": "Observações",
    "criadoEm": "data_criacao",
    "atualizadoEm": "data_atualizacao",
    "cidadeId": "uuid",
    "rotaId": "uuid",
    "cidade": {
      "nome": "Nome da Cidade",
      "estado": "UF"
    },
    "rota": {
      "nome": "Nome da Rota",
      "tipoCabo": "Tipo do Cabo"
    },
    "portas": [], // apenas para CTO
    "bandejas": [], // apenas para CEO
    "fusoes": [],
    "comentarios": [],
    "arquivos": [],
    "manutencoes": [],
    "_count": {
      "fusoes": 0,
      "portas": 0,
      "bandejas": 0,
      "comentarios": 0,
      "arquivos": 0,
      "manutencoes": 0
    }
  }
}
```

### PATCH /api/caixas/[id]

Atualiza uma caixa específica. Requer cargo de Engenheiro ou Gerente.

**Parâmetros:**

```json
{
  "nome": "Novo Nome", // opcional
  "modelo": "Novo Modelo", // opcional
  "coordenadas": { // opcional
    "latitude": 0,
    "longitude": 0
  },
  "observacoes": "Novas Observações", // opcional
  "rotaId": "uuid" // opcional
}
```

**Resposta:**

```json
{
  "mensagem": "Caixa atualizada com sucesso",
  "caixa": {
    "id": "uuid",
    "nome": "Novo Nome",
    "tipo": "CTO|CEO",
    "modelo": "Novo Modelo",
    "capacidade": 0,
    "coordenadas": {
      "latitude": 0,
      "longitude": 0
    },
    "observacoes": "Novas Observações",
    "cidadeId": "uuid",
    "rotaId": "uuid",
    "atualizadoEm": "data_atualizacao"
  }
}
```

### DELETE /api/caixas/[id]

Exclui uma caixa específica. Requer cargo de Engenheiro ou Gerente.

**Resposta:**

```json
{
  "mensagem": "Caixa excluída com sucesso"
}
```

### Portas

#### GET /api/caixas/[id]/portas

Lista todas as portas de uma caixa específica (apenas para caixas do tipo CTO).

**Parâmetros de consulta:**

- `status`: Filtro por status (Livre, Ocupada, Reservada, Defeito)

**Resposta:**

```json
{
  "caixa": {
    "id": "uuid",
    "nome": "Nome da Caixa",
    "capacidade": 0
  },
  "portas": [
    {
      "id": "uuid",
      "numero": 1,
      "status": "Livre|Ocupada|Reservada|Defeito",
      "observacoes": "Observações",
      "clienteNome": "Nome do Cliente",
      "clienteEndereco": "Endereço do Cliente",
      "clienteTelefone": "Telefone do Cliente",
      "caixaId": "uuid"
    }
  ],
  "estatisticas": {
    "total": 0,
    "livres": 0,
    "ocupadas": 0,
    "reservadas": 0,
    "defeito": 0
  }
}
```

#### PUT /api/caixas/[id]/portas

Atualiza múltiplas portas de uma caixa em lote. Requer cargo de Técnico, Engenheiro ou Gerente.

**Parâmetros:**

```json
{
  "portas": [
    {
      "id": "uuid",
      "status": "Livre|Ocupada|Reservada|Defeito", // opcional
      "observacoes": "Observações", // opcional
      "clienteNome": "Nome do Cliente", // opcional
      "clienteEndereco": "Endereço do Cliente", // opcional
      "clienteTelefone": "Telefone do Cliente" // opcional
    }
  ]
}
```

**Resposta:**

```json
{
  "mensagem": "X portas atualizadas com sucesso",
  "portas": [
    {
      "id": "uuid",
      "numero": 1,
      "status": "Livre|Ocupada|Reservada|Defeito",
      "observacoes": "Observações",
      "clienteNome": "Nome do Cliente",
      "clienteEndereco": "Endereço do Cliente",
      "clienteTelefone": "Telefone do Cliente",
      "caixaId": "uuid"
    }
  ]
}
```

## Fusões

### GET /api/fusoes

Lista todas as fusões com paginação e filtros.

**Parâmetros de consulta:**

- `pagina`: Número da página (padrão: 1)
- `limite`: Quantidade de itens por página (padrão: 10)
- `busca`: Termo para busca por origem ou destino
- `cidadeId`: Filtro por cidade
- `caixaId`: Filtro por caixa
- `bandejaId`: Filtro por bandeja

**Resposta:**

```json
{
  "fusoes": [
    {
      "id": "uuid",
      "posicao": 1,
      "cor": "#RRGGBB",
      "origem": "Origem",
      "destino": "Destino",
      "observacoes": "Observações",
      "criadoEm": "data_criacao",
      "atualizadoEm": "data_atualizacao",
      "caixaId": "uuid",
      "bandejaId": "uuid",
      "caixa": {
        "nome": "Nome da Caixa",
        "tipo": "CTO|CEO"
      },
      "bandeja": {
        "numero": 1
      }
    }
  ],
  "paginacao": {
    "total": 100,
    "pagina": 1,
    "limite": 10,
    "totalPaginas": 10
  }
}
```

### POST /api/fusoes

Cria uma nova fusão. Requer cargo de Técnico, Engenheiro ou Gerente.

**Parâmetros:**

```json
{
  "posicao": 1,
  "cor": "#RRGGBB", // opcional
  "origem": "Origem",
  "destino": "Destino",
  "observacoes": "Observações", // opcional
  "caixaId": "uuid",
  "bandejaId": "uuid" // opcional
}
```

**Resposta:**

```json
{
  "mensagem": "Fusão criada com sucesso",
  "fusao": {
    "id": "uuid",
    "posicao": 1,
    "cor": "#RRGGBB",
    "origem": "Origem",
    "destino": "Destino",
    "observacoes": "Observações",
    "caixaId": "uuid",
    "bandejaId": "uuid",
    "criadoEm": "data_criacao",
    "atualizadoEm": "data_atualizacao"
  }
}
```

### POST /api/fusoes/lote

Cria múltiplas fusões em lote. Requer cargo de Técnico, Engenheiro ou Gerente.

**Parâmetros:**

```json
{
  "fusoes": [
    {
      "posicao": 1,
      "cor": "#RRGGBB", // opcional
      "origem": "Origem",
      "destino": "Destino",
      "observacoes": "Observações", // opcional
      "caixaId": "uuid",
      "bandejaId": "uuid" // opcional
    }
  ]
}
```

**Resposta:**

```json
{
  "mensagem": "X fusões criadas com sucesso",
  "fusoes": [
    {
      "id": "uuid",
      "posicao": 1,
      "cor": "#RRGGBB",
      "origem": "Origem",
      "destino": "Destino",
      "observacoes": "Observações",
      "caixaId": "uuid",
      "bandejaId": "uuid",
      "criadoEm": "data_criacao",
      "atualizadoEm": "data_atualizacao"
    }
  ]
}
```

## Splitters

### GET /api/spliters
Lista todos os splitters com paginação e filtros.

**Parâmetros de consulta:**
- `pagina`: Número da página (padrão: 1)
- `limite`: Quantidade de itens por página (padrão: 10)
- `caixaId`: Filtro por caixa associada

**Resposta:**
```json
{
  "spliters": [
    {
      "id": "uuid",
      "nome": "Splitter 1",
      "atendimento": true,
      "tipo": "1x8",
      "caixaId": "uuid",
      "capilarSaidaId": "uuid",
      "capilarEntradaId": "uuid"
    }
  ],
  "paginacao": { "total": 10, "pagina": 1, "limite": 10, "totalPaginas": 1 }
}
```

### POST /api/spliters
Cria um novo splitter. Requer permissão de Engenheiro ou Gerente.

**Parâmetros:**
```json
{
  "nome": "Splitter 1",
  "atendimento": true,
  "tipo": "1x8",
  "caixaId": "uuid",
  "capilarSaidaId": "uuid",
  "capilarEntradaId": "uuid"
}
```
**Resposta:**
```json
{
  "mensagem": "Splitter criado com sucesso",
  "spliter": { /* dados do splitter */ }
}
```

## Clientes

### GET /api/clientes
Lista todos os clientes com paginação e filtros.

**Parâmetros de consulta:**
- `pagina`: Número da página (padrão: 1)
- `limite`: Quantidade de itens por página (padrão: 10)
- `busca`: Termo para busca por nome ou email

**Resposta:**
```json
{
  "clientes": [
    {
      "id": "uuid",
      "nome": "Cliente 1",
      "email": "cliente@exemplo.com",
      "portaId": "uuid",
      "neutraId": "uuid"
    }
  ],
  "paginacao": { "total": 10, "pagina": 1, "limite": 10, "totalPaginas": 1 }
}
```

### POST /api/clientes
Cria um novo cliente.

**Parâmetros:**
```json
{
  "nome": "Cliente 1",
  "email": "cliente@exemplo.com",
  "portaId": "uuid",
  "neutraId": "uuid"
}
```
**Resposta:**
```json
{
  "mensagem": "Cliente criado com sucesso",
  "cliente": { /* dados do cliente */ }
}
```

## Incidentes

### GET /api/incidentes
Lista todos os incidentes com paginação e filtros.

**Parâmetros de consulta:**
- `pagina`: Número da página (padrão: 1)
- `limite`: Quantidade de itens por página (padrão: 10)
- `status`: Filtro por status
- `prioridade`: Filtro por prioridade

**Resposta:**
```json
{
  "incidentes": [
    {
      "id": "uuid",
      "titulo": "Queda de sinal",
      "descricao": "Descrição do incidente",
      "status": "Aberto",
      "prioridade": "Alta",
      "impacto": "Crítico",
      "caixaId": "uuid"
    }
  ],
  "paginacao": { "total": 10, "pagina": 1, "limite": 10, "totalPaginas": 1 }
}
```

### POST /api/incidentes
Cria um novo incidente.

**Parâmetros:**
```json
{
  "titulo": "Queda de sinal",
  "descricao": "Descrição do incidente",
  "status": "Aberto",
  "prioridade": "Alta",
  "impacto": "Crítico",
  "caixaId": "uuid"
}
```
**Resposta:**
```json
{
  "mensagem": "Incidente criado com sucesso",
  "incidente": { /* dados do incidente */ }
}
```

## Relatórios

### GET /api/relatorios
Lista todos os relatórios com paginação e filtros.

**Parâmetros de consulta:**
- `pagina`: Número da página (padrão: 1)
- `limite`: Quantidade de itens por página (padrão: 10)
- `tipo`: Filtro por tipo de relatório

**Resposta:**
```json
{
  "relatorios": [
    {
      "id": "uuid",
      "titulo": "Relatório de Manutenção",
      "tipo": "manutencao",
      "dataInicio": "2024-01-01",
      "dataFim": "2024-01-02"
    }
  ],
  "paginacao": { "total": 10, "pagina": 1, "limite": 10, "totalPaginas": 1 }
}
```

### POST /api/relatorios
Cria um novo relatório.

**Parâmetros:**
```json
{
  "titulo": "Relatório de Manutenção",
  "descricao": "Descrição detalhada",
  "tipo": "manutencao",
  "dataInicio": "2024-01-01",
  "dataFim": "2024-01-02"
}
```
**Resposta:**
```json
{
  "mensagem": "Relatório criado com sucesso",
  "relatorio": { /* dados do relatório */ }
}
```

# ... restante da documentação ...