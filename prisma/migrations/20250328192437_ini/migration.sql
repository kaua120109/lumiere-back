/*
  Warnings:

  - You are about to drop the column `idade` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `usuario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "usuario" DROP COLUMN "idade",
DROP COLUMN "telefone",
ADD COLUMN     "celular" TEXT;
