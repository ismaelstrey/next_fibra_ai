-- CreateTable
CREATE TABLE "_Rota_caboCaixa" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_Rota_caboCaixa_A_fkey" FOREIGN KEY ("A") REFERENCES "Caixa" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_Rota_caboCaixa_B_fkey" FOREIGN KEY ("B") REFERENCES "Rota" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_Rota_caboCaixa_AB_unique" ON "_Rota_caboCaixa"("A", "B");

-- CreateIndex
CREATE INDEX "_Rota_caboCaixa_B_index" ON "_Rota_caboCaixa"("B");
