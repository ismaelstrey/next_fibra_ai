-- CreateTable
CREATE TABLE "Equipamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "fabricante" TEXT NOT NULL,
    "numeroSerie" TEXT,
    "dataInstalacao" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "tipo" TEXT NOT NULL,
    "descricao" TEXT,
    "observacoes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "caixaId" TEXT,
    "emendaId" TEXT,
    "clienteId" TEXT,
    "usuarioId" TEXT NOT NULL,
    CONSTRAINT "Equipamento_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Equipamento_emendaId_fkey" FOREIGN KEY ("emendaId") REFERENCES "Emenda" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Equipamento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Equipamento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Incidente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "dataOcorrencia" DATETIME NOT NULL,
    "dataResolucao" DATETIME,
    "status" TEXT NOT NULL,
    "prioridade" TEXT NOT NULL,
    "impacto" TEXT NOT NULL,
    "solucao" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "caixaId" TEXT,
    "capilarId" TEXT,
    "emendaId" TEXT,
    "clienteId" TEXT,
    "equipamentoId" TEXT,
    "usuarioId" TEXT NOT NULL,
    CONSTRAINT "Incidente_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Incidente_capilarId_fkey" FOREIGN KEY ("capilarId") REFERENCES "Capilar" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Incidente_emendaId_fkey" FOREIGN KEY ("emendaId") REFERENCES "Emenda" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Incidente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Incidente_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Incidente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Arquivo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rotaId" TEXT,
    "caixaId" TEXT,
    "manutencaoId" TEXT,
    "eventoId" TEXT,
    "relatorioId" TEXT,
    "tamanho" INTEGER,
    "usuarioId" TEXT,
    "capilarId" TEXT,
    "emendaId" TEXT,
    "clienteId" TEXT,
    "equipamentoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Arquivo_relatorioId_fkey" FOREIGN KEY ("relatorioId") REFERENCES "Relatorio" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "Rota" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_capilarId_fkey" FOREIGN KEY ("capilarId") REFERENCES "Capilar" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_emendaId_fkey" FOREIGN KEY ("emendaId") REFERENCES "Emenda" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Arquivo" ("caixaId", "capilarId", "clienteId", "createdAt", "criadoEm", "emendaId", "eventoId", "id", "manutencaoId", "nome", "relatorioId", "rotaId", "tamanho", "tipo", "updatedAt", "url", "usuarioId") SELECT "caixaId", "capilarId", "clienteId", "createdAt", "criadoEm", "emendaId", "eventoId", "id", "manutencaoId", "nome", "relatorioId", "rotaId", "tamanho", "tipo", "updatedAt", "url", "usuarioId" FROM "Arquivo";
DROP TABLE "Arquivo";
ALTER TABLE "new_Arquivo" RENAME TO "Arquivo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
