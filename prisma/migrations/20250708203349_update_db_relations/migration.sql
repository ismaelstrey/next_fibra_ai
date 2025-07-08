/*
  Warnings:

  - You are about to drop the column `fibraDestino` on the `Fusao` table. All the data in the column will be lost.
  - You are about to drop the column `fibraOrigem` on the `Fusao` table. All the data in the column will be lost.
  - Added the required column `destino` to the `Fusao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `origem` to the `Fusao` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "_fusao_origem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_fusao_origem_A_fkey" FOREIGN KEY ("A") REFERENCES "Capilar" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_fusao_origem_B_fkey" FOREIGN KEY ("B") REFERENCES "Fusao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_fusao_destino" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_fusao_destino_A_fkey" FOREIGN KEY ("A") REFERENCES "Capilar" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_fusao_destino_B_fkey" FOREIGN KEY ("B") REFERENCES "Fusao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Fusao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "origem" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "tuboOrigem" TEXT,
    "tuboDestino" TEXT,
    "status" TEXT NOT NULL,
    "cor" TEXT,
    "observacoes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "rotaOrigemId" TEXT NOT NULL,
    "caixaId" TEXT NOT NULL,
    "bandejaId" TEXT,
    CONSTRAINT "Fusao_bandejaId_fkey" FOREIGN KEY ("bandejaId") REFERENCES "Bandeja" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Fusao_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Fusao_rotaOrigemId_fkey" FOREIGN KEY ("rotaOrigemId") REFERENCES "Rota" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Fusao" ("atualizadoEm", "bandejaId", "caixaId", "cor", "criadoEm", "id", "observacoes", "rotaOrigemId", "status", "tuboDestino", "tuboOrigem") SELECT "atualizadoEm", "bandejaId", "caixaId", "cor", "criadoEm", "id", "observacoes", "rotaOrigemId", "status", "tuboDestino", "tuboOrigem" FROM "Fusao";
DROP TABLE "Fusao";
ALTER TABLE "new_Fusao" RENAME TO "Fusao";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_fusao_origem_AB_unique" ON "_fusao_origem"("A", "B");

-- CreateIndex
CREATE INDEX "_fusao_origem_B_index" ON "_fusao_origem"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_fusao_destino_AB_unique" ON "_fusao_destino"("A", "B");

-- CreateIndex
CREATE INDEX "_fusao_destino_B_index" ON "_fusao_destino"("B");
