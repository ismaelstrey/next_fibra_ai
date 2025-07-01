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
    "caixaId" TEXT,
    "portaId" TEXT,
    CONSTRAINT "Cliente_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cliente_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cliente_neutraId_fkey" FOREIGN KEY ("neutraId") REFERENCES "Neutra" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Cliente" ("apartamento", "caixaId", "casa", "cidadeId", "cpf", "email", "endereco", "id", "neutraId", "nome", "numero", "portaId", "potencia", "senha", "senhaWifi", "telefone", "wifi") SELECT "apartamento", "caixaId", "casa", "cidadeId", "cpf", "email", "endereco", "id", "neutraId", "nome", "numero", "portaId", "potencia", "senha", "senhaWifi", "telefone", "wifi" FROM "Cliente";
DROP TABLE "Cliente";
ALTER TABLE "new_Cliente" RENAME TO "Cliente";
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");
CREATE TABLE "new_Porta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "clienteNome" TEXT,
    "clienteId" TEXT,
    "observacoes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "caixaId" TEXT NOT NULL,
    "spliterId" TEXT,
    CONSTRAINT "Porta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Porta_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Porta_spliterId_fkey" FOREIGN KEY ("spliterId") REFERENCES "Spliter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Porta" ("atualizadoEm", "caixaId", "clienteId", "clienteNome", "criadoEm", "id", "numero", "observacoes", "spliterId", "status") SELECT "atualizadoEm", "caixaId", "clienteId", "clienteNome", "criadoEm", "id", "numero", "observacoes", "spliterId", "status" FROM "Porta";
DROP TABLE "Porta";
ALTER TABLE "new_Porta" RENAME TO "Porta";
CREATE UNIQUE INDEX "Porta_clienteId_key" ON "Porta"("clienteId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
