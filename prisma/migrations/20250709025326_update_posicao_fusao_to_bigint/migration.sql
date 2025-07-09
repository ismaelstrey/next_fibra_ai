/*
  Warnings:

  - You are about to drop the `_fusao_destino` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_fusao_origem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_fusao_destino";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_fusao_origem";
PRAGMA foreign_keys=on;
