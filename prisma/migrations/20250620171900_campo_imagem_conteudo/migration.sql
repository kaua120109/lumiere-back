/*
  Warnings:

  - You are about to drop the column `destaque` on the `conteudo` table. All the data in the column will be lost.
  - You are about to drop the column `tipoMidiaCapa` on the `conteudo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "conteudo" DROP COLUMN "destaque",
DROP COLUMN "tipoMidiaCapa";
