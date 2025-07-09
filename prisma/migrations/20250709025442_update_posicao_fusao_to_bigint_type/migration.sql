/*
  Warnings:

  - You are about to alter the column `posicaoFusao` on the `Fusao` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Fusao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "capilarOrigemId" TEXT NOT NULL,
    "capilarDestinoId" TEXT NOT NULL,
    "tipoFusao" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "qualidadeSinal" REAL,
    "perdaInsercao" REAL,
    "cor" TEXT,
    "observacoes" TEXT,
    "caixaId" TEXT NOT NULL,
    "bandejaId" TEXT,
    "posicaoFusao" BIGINT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "criadoPorId" TEXT,
    CONSTRAINT "Fusao_capilarOrigemId_fkey" FOREIGN KEY ("capilarOrigemId") REFERENCES "Capilar" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Fusao_capilarDestinoId_fkey" FOREIGN KEY ("capilarDestinoId") REFERENCES "Capilar" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Fusao_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Fusao_bandejaId_fkey" FOREIGN KEY ("bandejaId") REFERENCES "Bandeja" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Fusao_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Fusao" ("atualizadoEm", "bandejaId", "caixaId", "capilarDestinoId", "capilarOrigemId", "cor", "criadoEm", "criadoPorId", "id", "observacoes", "perdaInsercao", "posicaoFusao", "qualidadeSinal", "status", "tipoFusao") SELECT "atualizadoEm", "bandejaId", "caixaId", "capilarDestinoId", "capilarOrigemId", "cor", "criadoEm", "criadoPorId", "id", "observacoes", "perdaInsercao", "posicaoFusao", "qualidadeSinal", "status", "tipoFusao" FROM "Fusao";
DROP TABLE "Fusao";
ALTER TABLE "new_Fusao" RENAME TO "Fusao";
CREATE INDEX "Fusao_caixaId_idx" ON "Fusao"("caixaId");
CREATE INDEX "Fusao_status_idx" ON "Fusao"("status");
CREATE UNIQUE INDEX "Fusao_capilarOrigemId_capilarDestinoId_key" ON "Fusao"("capilarOrigemId", "capilarDestinoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
