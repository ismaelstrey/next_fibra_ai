/*
  Warnings:

  - Added the required column `quantidadeCapilares` to the `Tubo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo` to the `Tubo` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tubo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "quantidadeCapilares" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "rotaId" TEXT,
    CONSTRAINT "Tubo_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "Rota" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Tubo" ("id", "numero", "rotaId") SELECT "id", "numero", "rotaId" FROM "Tubo";
DROP TABLE "Tubo";
ALTER TABLE "new_Tubo" RENAME TO "Tubo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
