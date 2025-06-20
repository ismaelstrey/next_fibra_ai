-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Emenda" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "localizacao" TEXT NOT NULL,
    "capilarSaidaId" TEXT NOT NULL,
    "capilarEntradaId" TEXT NOT NULL,
    "cidadeId" TEXT,
    CONSTRAINT "Emenda_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Emenda_capilarSaidaId_fkey" FOREIGN KEY ("capilarSaidaId") REFERENCES "Capilar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Emenda_capilarEntradaId_fkey" FOREIGN KEY ("capilarEntradaId") REFERENCES "Capilar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Emenda" ("capilarEntradaId", "capilarSaidaId", "id", "localizacao") SELECT "capilarEntradaId", "capilarSaidaId", "id", "localizacao" FROM "Emenda";
DROP TABLE "Emenda";
ALTER TABLE "new_Emenda" RENAME TO "Emenda";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
