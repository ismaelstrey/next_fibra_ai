/*
  Warnings:

  - You are about to drop the column `rotaId` on the `Caixa` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "RotaCaixa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rotaId" TEXT NOT NULL,
    "caixaId" TEXT NOT NULL,
    "tipoConexao" TEXT NOT NULL,
    "ordem" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "RotaCaixa_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "Rota" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RotaCaixa_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Migra dados existentes da relação Caixa -> Rota para RotaCaixa
INSERT INTO "RotaCaixa" ("id", "rotaId", "caixaId", "tipoConexao", "ordem", "criadoEm", "atualizadoEm")
SELECT 
    lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))) as id,
    "rotaId",
    "id" as "caixaId",
    'passagem' as "tipoConexao",
    1 as "ordem",
    "criadoEm",
    "atualizadoEm"
FROM "Caixa" 
WHERE "rotaId" IS NOT NULL;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Caixa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "capacidade" INTEGER NOT NULL,
    "coordenadas" JSONB NOT NULL,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "cidadeId" TEXT NOT NULL,
    CONSTRAINT "Caixa_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Caixa" ("atualizadoEm", "capacidade", "cidadeId", "coordenadas", "criadoEm", "id", "modelo", "nome", "observacoes", "status", "tipo") SELECT "atualizadoEm", "capacidade", "cidadeId", "coordenadas", "criadoEm", "id", "modelo", "nome", "observacoes", "status", "tipo" FROM "Caixa";
DROP TABLE "Caixa";
ALTER TABLE "new_Caixa" RENAME TO "Caixa";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "RotaCaixa_rotaId_caixaId_key" ON "RotaCaixa"("rotaId", "caixaId");
