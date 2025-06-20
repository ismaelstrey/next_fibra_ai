-- AlterTable
ALTER TABLE "Evento" ADD COLUMN "localizacao" TEXT;

-- CreateTable
CREATE TABLE "Participante" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Cabo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "origem" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "comprimento" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "tipoCabo" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "potencia" REAL NOT NULL,
    "tensao" REAL NOT NULL,
    "cor" TEXT NOT NULL,
    "tipoCorte" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Capilar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "comprimento" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "potencia" REAL NOT NULL,
    "cor" TEXT NOT NULL,
    "caboId" TEXT NOT NULL,
    CONSTRAINT "Capilar_caboId_fkey" FOREIGN KEY ("caboId") REFERENCES "Cabo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Emenda" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "localizacao" TEXT NOT NULL,
    "capilarSaidaId" TEXT NOT NULL,
    "capilarEntradaId" TEXT NOT NULL,
    CONSTRAINT "Emenda_capilarSaidaId_fkey" FOREIGN KEY ("capilarSaidaId") REFERENCES "Capilar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Emenda_capilarEntradaId_fkey" FOREIGN KEY ("capilarEntradaId") REFERENCES "Capilar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT,
    "telefone" TEXT,
    "apartamento" TEXT,
    "endereco" TEXT,
    "casa" TEXT,
    "numero" INTEGER NOT NULL,
    "potencia" REAL NOT NULL,
    "wifi" TEXT NOT NULL,
    "senhaWifi" TEXT NOT NULL,
    "neutraId" TEXT NOT NULL,
    "portaId" TEXT NOT NULL,
    CONSTRAINT "Cliente_neutraId_fkey" FOREIGN KEY ("neutraId") REFERENCES "Neutra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Cliente_portaId_fkey" FOREIGN KEY ("portaId") REFERENCES "Porta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Neutra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "vlan" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Spliter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "vlan" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "capilarSaidaId" TEXT NOT NULL,
    "capilarEntradaId" TEXT NOT NULL,
    CONSTRAINT "Spliter_capilarSaidaId_fkey" FOREIGN KEY ("capilarSaidaId") REFERENCES "Capilar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Spliter_capilarEntradaId_fkey" FOREIGN KEY ("capilarEntradaId") REFERENCES "Capilar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_EventoToManutencao" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_EventoToManutencao_A_fkey" FOREIGN KEY ("A") REFERENCES "Evento" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EventoToManutencao_B_fkey" FOREIGN KEY ("B") REFERENCES "Manutencao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_EventoToParticipante" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_EventoToParticipante_A_fkey" FOREIGN KEY ("A") REFERENCES "Evento" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EventoToParticipante_B_fkey" FOREIGN KEY ("B") REFERENCES "Participante" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ParticipanteToUsuario" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ParticipanteToUsuario_A_fkey" FOREIGN KEY ("A") REFERENCES "Participante" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ParticipanteToUsuario_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ParticipanteToRelatorio" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ParticipanteToRelatorio_A_fkey" FOREIGN KEY ("A") REFERENCES "Participante" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ParticipanteToRelatorio_B_fkey" FOREIGN KEY ("B") REFERENCES "Relatorio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_EventoToManutencao_AB_unique" ON "_EventoToManutencao"("A", "B");

-- CreateIndex
CREATE INDEX "_EventoToManutencao_B_index" ON "_EventoToManutencao"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EventoToParticipante_AB_unique" ON "_EventoToParticipante"("A", "B");

-- CreateIndex
CREATE INDEX "_EventoToParticipante_B_index" ON "_EventoToParticipante"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ParticipanteToUsuario_AB_unique" ON "_ParticipanteToUsuario"("A", "B");

-- CreateIndex
CREATE INDEX "_ParticipanteToUsuario_B_index" ON "_ParticipanteToUsuario"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ParticipanteToRelatorio_AB_unique" ON "_ParticipanteToRelatorio"("A", "B");

-- CreateIndex
CREATE INDEX "_ParticipanteToRelatorio_B_index" ON "_ParticipanteToRelatorio"("B");
