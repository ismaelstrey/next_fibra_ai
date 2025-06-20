/*
  Warnings:

  - You are about to drop the `Cabo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `caboId` on the `Capilar` table. All the data in the column will be lost.
  - You are about to drop the column `cor` on the `Capilar` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Cabo";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_CapilarToRota" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CapilarToRota_A_fkey" FOREIGN KEY ("A") REFERENCES "Capilar" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CapilarToRota_B_fkey" FOREIGN KEY ("B") REFERENCES "Rota" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "potencia" REAL NOT NULL
);
INSERT INTO "new_Capilar" ("comprimento", "id", "numero", "potencia", "status", "tipo") SELECT "comprimento", "id", "numero", "potencia", "status", "tipo" FROM "Capilar";
DROP TABLE "Capilar";
ALTER TABLE "new_Capilar" RENAME TO "Capilar";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_CapilarToRota_AB_unique" ON "_CapilarToRota"("A", "B");

-- CreateIndex
CREATE INDEX "_CapilarToRota_B_index" ON "_CapilarToRota"("B");
