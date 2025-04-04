/*
  Warnings:

  - The `imagem` column on the `produto` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "produto" DROP COLUMN "imagem",
ADD COLUMN     "imagem" TEXT[];
