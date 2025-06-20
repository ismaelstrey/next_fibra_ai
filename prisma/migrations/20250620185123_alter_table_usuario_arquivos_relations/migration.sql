/*
  Warnings:

  - You are about to drop the `_ArquivoToUsuario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "_ArquivoToUsuario_B_index";

-- DropIndex
DROP INDEX "_ArquivoToUsuario_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_ArquivoToUsuario";
PRAGMA foreign_keys=on;

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
    CONSTRAINT "Arquivo_relatorioId_fkey" FOREIGN KEY ("relatorioId") REFERENCES "Relatorio" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "Rota" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Arquivo" ("caixaId", "criadoEm", "eventoId", "id", "manutencaoId", "nome", "relatorioId", "rotaId", "tipo", "url") SELECT "caixaId", "criadoEm", "eventoId", "id", "manutencaoId", "nome", "relatorioId", "rotaId", "tipo", "url" FROM "Arquivo";
DROP TABLE "Arquivo";
ALTER TABLE "new_Arquivo" RENAME TO "Arquivo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
