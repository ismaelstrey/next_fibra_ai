-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Equipamento" (
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
    "cidadeId" TEXT,
    CONSTRAINT "Equipamento_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Equipamento_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Equipamento_emendaId_fkey" FOREIGN KEY ("emendaId") REFERENCES "Emenda" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Equipamento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Equipamento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Equipamento" ("atualizadoEm", "caixaId", "clienteId", "criadoEm", "dataInstalacao", "descricao", "emendaId", "fabricante", "id", "modelo", "nome", "numeroSerie", "observacoes", "status", "tipo", "usuarioId") SELECT "atualizadoEm", "caixaId", "clienteId", "criadoEm", "dataInstalacao", "descricao", "emendaId", "fabricante", "id", "modelo", "nome", "numeroSerie", "observacoes", "status", "tipo", "usuarioId" FROM "Equipamento";
DROP TABLE "Equipamento";
ALTER TABLE "new_Equipamento" RENAME TO "Equipamento";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
