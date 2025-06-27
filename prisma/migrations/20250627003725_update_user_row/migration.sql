-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "senha" TEXT,
    "telefone" TEXT,
    "cpf" TEXT,
    "apartamento" TEXT,
    "endereco" TEXT,
    "casa" TEXT,
    "numero" INTEGER NOT NULL,
    "potencia" REAL,
    "wifi" TEXT,
    "senhaWifi" TEXT,
    "neutraId" TEXT,
    "cidadeId" TEXT,
    "portaId" TEXT NOT NULL,
    CONSTRAINT "Cliente_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cliente_neutraId_fkey" FOREIGN KEY ("neutraId") REFERENCES "Neutra" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cliente_portaId_fkey" FOREIGN KEY ("portaId") REFERENCES "Porta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Cliente" ("apartamento", "casa", "cidadeId", "cpf", "email", "endereco", "id", "neutraId", "nome", "numero", "portaId", "potencia", "senha", "senhaWifi", "telefone", "wifi") SELECT "apartamento", "casa", "cidadeId", "cpf", "email", "endereco", "id", "neutraId", "nome", "numero", "portaId", "potencia", "senha", "senhaWifi", "telefone", "wifi" FROM "Cliente";
DROP TABLE "Cliente";
ALTER TABLE "new_Cliente" RENAME TO "Cliente";
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
