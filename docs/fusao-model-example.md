# Modelo Fusao Atualizado - Exemplos de Uso

## Visão Geral

O modelo `Fusao` foi completamente reestruturado para permitir fusões diretas entre capilares, oferecendo maior flexibilidade e precisão no sistema de documentação de redes de fibra óptica.

## Principais Melhorias

### 1. Relacionamentos Diretos com Capilares
- **Antes**: Usava apenas números de fibra (`fibraOrigem`, `fibraDestino`)
- **Agora**: Relacionamentos diretos com capilares (`capilarOrigemId`, `capilarDestinoId`)

### 2. Tipos de Fusão
- `capilar_capilar`: Fusão entre dois capilares
- `capilar_splitter`: Fusão de capilar com splitter
- `splitter_cliente`: Fusão de splitter com cliente

### 3. Métricas de Qualidade
- `qualidadeSinal`: Qualidade do sinal em dB
- `perdaInsercao`: Perda de inserção em dB

### 4. Localização Precisa
- `caixaId`: Caixa onde a fusão está localizada
- `bandejaId`: Bandeja específica (opcional)
- `posicaoFusao`: Posição na bandeja

## Exemplos de Uso

### Criar uma Fusão entre Capilares

```typescript
// Exemplo de criação de fusão
const novaFusao = await prisma.fusao.create({
  data: {
    capilarOrigemId: "capilar_001",
    capilarDestinoId: "capilar_002",
    tipoFusao: "capilar_capilar",
    status: "Ativa",
    qualidadeSinal: -0.5,
    perdaInsercao: 0.2,
    cor: "azul",
    caixaId: "caixa_001",
    bandejaId: "bandeja_001",
    posicaoFusao: 1,
    criadoPorId: "usuario_001",
    observacoes: "Fusão realizada durante instalação inicial"
  }
});
```

### Buscar Fusões de um Capilar

```typescript
// Buscar todas as fusões onde um capilar está envolvido
const fusoesDoCapilar = await prisma.capilar.findUnique({
  where: { id: "capilar_001" },
  include: {
    fusoesOrigem: {
      include: {
        capilarDestino: true,
        caixa: true,
        bandeja: true
      }
    },
    fusoesDestino: {
      include: {
        capilarOrigem: true,
        caixa: true,
        bandeja: true
      }
    }
  }
});
```

### Buscar Fusões por Caixa

```typescript
// Buscar todas as fusões em uma caixa específica
const fusoesDaCaixa = await prisma.fusao.findMany({
  where: {
    caixaId: "caixa_001",
    status: "Ativa"
  },
  include: {
    capilarOrigem: {
      include: {
        tubo: true
      }
    },
    capilarDestino: {
      include: {
        tubo: true
      }
    },
    bandeja: true,
    criadoPor: true
  },
  orderBy: {
    posicaoFusao: 'asc'
  }
});
```

### Atualizar Status de uma Fusão

```typescript
// Marcar fusão como em manutenção
const fusaoAtualizada = await prisma.fusao.update({
  where: { id: "fusao_001" },
  data: {
    status: "Manutencao",
    observacoes: "Fusão em manutenção - sinal degradado",
    qualidadeSinal: -2.5
  }
});
```

## Benefícios da Nova Estrutura

1. **Integridade Referencial**: Relacionamentos diretos garantem consistência
2. **Rastreabilidade**: Histórico completo de quem criou cada fusão
3. **Localização Precisa**: Identificação exata da posição física
4. **Métricas de Qualidade**: Monitoramento da qualidade do sinal
5. **Flexibilidade**: Suporte a diferentes tipos de fusão
6. **Performance**: Índices otimizados para consultas frequentes
7. **Prevenção de Duplicatas**: Constraint única evita fusões duplicadas

## Considerações de Migração

- As fusões existentes precisarão ser migradas manualmente
- Verificar se todos os `capilarId` existem antes da migração
- Atualizar APIs e interfaces que usavam o modelo antigo
- Revisar relatórios e consultas que dependiam dos campos antigos