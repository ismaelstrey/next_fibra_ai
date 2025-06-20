-- CreateTable
CREATE TABLE "_ArquivoToUsuario" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ArquivoToUsuario_A_fkey" FOREIGN KEY ("A") REFERENCES "Arquivo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ArquivoToUsuario_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_ArquivoToUsuario_AB_unique" ON "_ArquivoToUsuario"("A", "B");

-- CreateIndex
CREATE INDEX "_ArquivoToUsuario_B_index" ON "_ArquivoToUsuario"("B");
