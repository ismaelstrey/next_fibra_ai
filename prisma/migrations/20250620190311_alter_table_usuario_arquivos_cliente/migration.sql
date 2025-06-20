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
    "usuarioId" TEXT,
    "capilarId" TEXT,
    "emendaId" TEXT,
    "clienteId" TEXT,
    CONSTRAINT "Arquivo_relatorioId_fkey" FOREIGN KEY ("relatorioId") REFERENCES "Relatorio" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "Rota" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_capilarId_fkey" FOREIGN KEY ("capilarId") REFERENCES "Capilar" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_emendaId_fkey" FOREIGN KEY ("emendaId") REFERENCES "Emenda" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Arquivo" ("caixaId", "capilarId", "criadoEm", "emendaId", "eventoId", "id", "manutencaoId", "nome", "relatorioId", "rotaId", "tipo", "url", "usuarioId") SELECT "caixaId", "capilarId", "criadoEm", "emendaId", "eventoId", "id", "manutencaoId", "nome", "relatorioId", "rotaId", "tipo", "url", "usuarioId" FROM "Arquivo";
DROP TABLE "Arquivo";
ALTER TABLE "new_Arquivo" RENAME TO "Arquivo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
