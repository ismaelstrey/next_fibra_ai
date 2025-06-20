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
    CONSTRAINT "Capilar_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Capilar" ("comprimento", "id", "numero", "potencia", "status", "tipo") SELECT "comprimento", "id", "numero", "potencia", "status", "tipo" FROM "Capilar";
DROP TABLE "Capilar";
ALTER TABLE "new_Capilar" RENAME TO "Capilar";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
