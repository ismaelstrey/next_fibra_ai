/*
  Warnings:

  - You are about to drop the column `vlan` on the `Spliter` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Spliter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "atendimento" BOOLEAN NOT NULL DEFAULT true,
    "tipo" TEXT NOT NULL,
    "caixaId" TEXT NOT NULL,
    "capilarSaidaId" TEXT NOT NULL,
    "capilarEntradaId" TEXT NOT NULL,
    CONSTRAINT "Spliter_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Spliter_capilarSaidaId_fkey" FOREIGN KEY ("capilarSaidaId") REFERENCES "Capilar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Spliter_capilarEntradaId_fkey" FOREIGN KEY ("capilarEntradaId") REFERENCES "Capilar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Spliter" ("caixaId", "capilarEntradaId", "capilarSaidaId", "id", "nome", "tipo") SELECT "caixaId", "capilarEntradaId", "capilarSaidaId", "id", "nome", "tipo" FROM "Spliter";
DROP TABLE "Spliter";
ALTER TABLE "new_Spliter" RENAME TO "Spliter";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
