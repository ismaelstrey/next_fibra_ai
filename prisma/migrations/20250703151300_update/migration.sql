/*
  Warnings:

  - You are about to drop the column `rotaId` on the `Capilar` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Tubo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "rotaId" TEXT,
    CONSTRAINT "Tubo_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "Rota" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CapilarToTubo" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CapilarToTubo_A_fkey" FOREIGN KEY ("A") REFERENCES "Capilar" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CapilarToTubo_B_fkey" FOREIGN KEY ("B") REFERENCES "Tubo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Capilar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "comprimento" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "potencia" REAL NOT NULL,
    "cidadeId" TEXT,
    "spliterId" TEXT,
    CONSTRAINT "Capilar_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Capilar_spliterId_fkey" FOREIGN KEY ("spliterId") REFERENCES "Spliter" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Capilar" ("cidadeId", "comprimento", "id", "numero", "potencia", "spliterId", "status", "tipo") SELECT "cidadeId", "comprimento", "id", "numero", "potencia", "spliterId", "status", "tipo" FROM "Capilar";
DROP TABLE "Capilar";
ALTER TABLE "new_Capilar" RENAME TO "Capilar";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_CapilarToTubo_AB_unique" ON "_CapilarToTubo"("A", "B");

-- CreateIndex
CREATE INDEX "_CapilarToTubo_B_index" ON "_CapilarToTubo"("B");
