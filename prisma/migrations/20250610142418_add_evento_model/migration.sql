/*
  Warnings:

  - Added the required column `cidadeId` to the `Manutencao` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Responsavel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dataInicio" DATETIME NOT NULL,
    "dataFim" DATETIME,
    "prioridade" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "cidadeId" TEXT,
    "rotaId" TEXT,
    "caixaId" TEXT,
    "usuarioId" TEXT,
    CONSTRAINT "Evento_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Evento_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "Rota" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Evento_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Evento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Arquivo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rotaId" TEXT,
    "caixaId" TEXT,
    "manutencaoId" TEXT,
    "eventoId" TEXT,
    CONSTRAINT "Arquivo_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "Rota" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Arquivo_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Arquivo" ("caixaId", "criadoEm", "id", "manutencaoId", "nome", "rotaId", "tipo", "url") SELECT "caixaId", "criadoEm", "id", "manutencaoId", "nome", "rotaId", "tipo", "url" FROM "Arquivo";
DROP TABLE "Arquivo";
ALTER TABLE "new_Arquivo" RENAME TO "Arquivo";
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
    "rotaId" TEXT NOT NULL,
    CONSTRAINT "Caixa_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Caixa_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "Rota" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Caixa" ("atualizadoEm", "capacidade", "cidadeId", "coordenadas", "criadoEm", "id", "modelo", "nome", "observacoes", "rotaId", "tipo") SELECT "atualizadoEm", "capacidade", "cidadeId", "coordenadas", "criadoEm", "id", "modelo", "nome", "observacoes", "rotaId", "tipo" FROM "Caixa";
DROP TABLE "Caixa";
ALTER TABLE "new_Caixa" RENAME TO "Caixa";
CREATE TABLE "new_Comentario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "texto" TEXT NOT NULL,
    "conteudo" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "rotaId" TEXT,
    "caixaId" TEXT,
    "manutencaoId" TEXT,
    "eventoId" TEXT,
    CONSTRAINT "Comentario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comentario_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "Rota" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Comentario_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Comentario_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Comentario_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Comentario" ("atualizadoEm", "caixaId", "conteudo", "criadoEm", "id", "rotaId", "texto", "usuarioId") SELECT "atualizadoEm", "caixaId", "conteudo", "criadoEm", "id", "rotaId", "texto", "usuarioId" FROM "Comentario";
DROP TABLE "Comentario";
ALTER TABLE "new_Comentario" RENAME TO "Comentario";
CREATE TABLE "new_Manutencao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dataInicio" DATETIME NOT NULL,
    "titulo" TEXT NOT NULL,
    "dataFim" DATETIME,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "prioridade" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "dataManutencao" DATETIME,
    "cidadeId" TEXT NOT NULL,
    "rotaId" TEXT NOT NULL,
    "caixaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "responsavelId" TEXT,
    CONSTRAINT "Manutencao_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Manutencao_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "Rota" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Manutencao_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Manutencao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Manutencao_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Responsavel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Manutencao" ("atualizadoEm", "caixaId", "criadoEm", "dataFim", "dataInicio", "dataManutencao", "descricao", "id", "prioridade", "rotaId", "status", "tipo", "titulo", "usuarioId") SELECT "atualizadoEm", "caixaId", "criadoEm", "dataFim", "dataInicio", "dataManutencao", "descricao", "id", "prioridade", "rotaId", "status", "tipo", "titulo", "usuarioId" FROM "Manutencao";
DROP TABLE "Manutencao";
ALTER TABLE "new_Manutencao" RENAME TO "Manutencao";
CREATE TABLE "new_Notificacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "prioridade" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "cidadeId" TEXT,
    "caixaId" TEXT,
    "rotaId" TEXT,
    "manutencaoId" TEXT,
    "eventoId" TEXT,
    "criadorId" TEXT NOT NULL,
    "cargoDestinatarios" TEXT NOT NULL,
    CONSTRAINT "Notificacao_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notificacao_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notificacao_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "Rota" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notificacao_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notificacao_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notificacao_criadorId_fkey" FOREIGN KEY ("criadorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Notificacao" ("atualizadoEm", "caixaId", "cargoDestinatarios", "cidadeId", "conteudo", "criadoEm", "criadorId", "id", "manutencaoId", "prioridade", "rotaId", "tipo", "titulo") SELECT "atualizadoEm", "caixaId", "cargoDestinatarios", "cidadeId", "conteudo", "criadoEm", "criadorId", "id", "manutencaoId", "prioridade", "rotaId", "tipo", "titulo" FROM "Notificacao";
DROP TABLE "Notificacao";
ALTER TABLE "new_Notificacao" RENAME TO "Notificacao";
CREATE TABLE "new_Rota" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "tipoCabo" TEXT NOT NULL,
    "fabricante" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "distancia" REAL,
    "profundidade" REAL,
    "tipoPassagem" TEXT NOT NULL,
    "coordenadas" JSONB NOT NULL,
    "cor" TEXT,
    "observacoes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "cidadeId" TEXT NOT NULL,
    CONSTRAINT "Rota_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Rota" ("atualizadoEm", "cidadeId", "coordenadas", "cor", "criadoEm", "distancia", "fabricante", "id", "nome", "observacoes", "profundidade", "tipoCabo", "tipoPassagem") SELECT "atualizadoEm", "cidadeId", "coordenadas", "cor", "criadoEm", "distancia", "fabricante", "id", "nome", "observacoes", "profundidade", "tipoCabo", "tipoPassagem" FROM "Rota";
DROP TABLE "Rota";
ALTER TABLE "new_Rota" RENAME TO "Rota";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
