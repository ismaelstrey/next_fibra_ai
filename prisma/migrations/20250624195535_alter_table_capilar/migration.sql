-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Emenda" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "localizacao" TEXT NOT NULL,
    "capilarSaidaId" TEXT,
    "capilarEntradaId" TEXT,
    "cidadeId" TEXT,
    "spliterSaidaId" TEXT,
    "spliterEntradaId" TEXT,
    CONSTRAINT "Emenda_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Emenda_capilarSaidaId_fkey" FOREIGN KEY ("capilarSaidaId") REFERENCES "Capilar" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Emenda_capilarEntradaId_fkey" FOREIGN KEY ("capilarEntradaId") REFERENCES "Capilar" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Emenda_spliterEntradaId_fkey" FOREIGN KEY ("spliterEntradaId") REFERENCES "Spliter" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Emenda_spliterSaidaId_fkey" FOREIGN KEY ("spliterSaidaId") REFERENCES "Spliter" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Emenda" ("capilarEntradaId", "capilarSaidaId", "cidadeId", "id", "localizacao") SELECT "capilarEntradaId", "capilarSaidaId", "cidadeId", "id", "localizacao" FROM "Emenda";
DROP TABLE "Emenda";
ALTER TABLE "new_Emenda" RENAME TO "Emenda";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
