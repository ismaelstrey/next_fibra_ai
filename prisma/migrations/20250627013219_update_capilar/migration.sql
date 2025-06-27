/*
  Warnings:

  - You are about to drop the column `capilarSaidaId` on the `Spliter` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_CapilarToSpliter" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CapilarToSpliter_A_fkey" FOREIGN KEY ("A") REFERENCES "Capilar" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CapilarToSpliter_B_fkey" FOREIGN KEY ("B") REFERENCES "Spliter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Spliter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "atendimento" BOOLEAN NOT NULL DEFAULT true,
    "tipo" TEXT NOT NULL,
    "caixaId" TEXT NOT NULL,
    "capilarEntradaId" TEXT,
    CONSTRAINT "Spliter_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Spliter_capilarEntradaId_fkey" FOREIGN KEY ("capilarEntradaId") REFERENCES "Capilar" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Spliter" ("atendimento", "caixaId", "capilarEntradaId", "id", "nome", "tipo") SELECT "atendimento", "caixaId", "capilarEntradaId", "id", "nome", "tipo" FROM "Spliter";
DROP TABLE "Spliter";
ALTER TABLE "new_Spliter" RENAME TO "Spliter";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_CapilarToSpliter_AB_unique" ON "_CapilarToSpliter"("A", "B");

-- CreateIndex
CREATE INDEX "_CapilarToSpliter_B_index" ON "_CapilarToSpliter"("B");
