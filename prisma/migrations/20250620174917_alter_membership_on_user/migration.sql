/*
  Warnings:

  - You are about to drop the `membro` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "membro" DROP CONSTRAINT "membro_usuarioid_fkey";

-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "dataExpiracao" TIMESTAMP(3),
ADD COLUMN     "dataInicioMembro" TIMESTAMP(3);

-- DropTable
DROP TABLE "membro";
