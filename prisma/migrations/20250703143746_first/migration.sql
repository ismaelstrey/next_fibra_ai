/*
  Warnings:

  - You are about to drop the `_CapilarToRota` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "_CapilarToRota_B_index";

-- DropIndex
DROP INDEX "_CapilarToRota_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_CapilarToRota";
PRAGMA foreign_keys=on;

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
    "rotaId" TEXT,
    "spliterId" TEXT,
    CONSTRAINT "Capilar_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Capilar_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "Rota" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Capilar_spliterId_fkey" FOREIGN KEY ("spliterId") REFERENCES "Spliter" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Capilar" ("cidadeId", "comprimento", "id", "numero", "potencia", "spliterId", "status", "tipo") SELECT "cidadeId", "comprimento", "id", "numero", "potencia", "spliterId", "status", "tipo" FROM "Capilar";
DROP TABLE "Capilar";
ALTER TABLE "new_Capilar" RENAME TO "Capilar";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
