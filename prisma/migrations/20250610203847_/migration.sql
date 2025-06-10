/*
  Warnings:

  - You are about to drop the `conteudoUsuario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `evento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `eventoUsuario` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[usuario]` on the table `usuario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `usuario` will be added. If there are existing duplicate values, this will fail.
  - Made the column `email` on table `usuario` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "conteudoUsuario" DROP CONSTRAINT "conteudoUsuario_conteudoid_fkey";

-- DropForeignKey
ALTER TABLE "conteudoUsuario" DROP CONSTRAINT "conteudoUsuario_usuarioid_fkey";

-- DropForeignKey
ALTER TABLE "eventoUsuario" DROP CONSTRAINT "eventoUsuario_eventoid_fkey";

-- DropForeignKey
ALTER TABLE "eventoUsuario" DROP CONSTRAINT "eventoUsuario_usuarioid_fkey";

-- AlterTable
ALTER TABLE "produto" ADD COLUMN     "cores" TEXT[],
ADD COLUMN     "dataFimOferta" TIMESTAMP(3),
ADD COLUMN     "dataInicioOferta" TIMESTAMP(3),
ADD COLUMN     "emOferta" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "imagensAdicionais" TEXT[],
ADD COLUMN     "porcentagemDesconto" INTEGER,
ADD COLUMN     "precoOriginal" DOUBLE PRECISION,
ADD COLUMN     "tamanhos" TEXT[];

-- AlterTable
ALTER TABLE "recompensa" ADD COLUMN     "nivelMinimo" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "nivelMembro" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "pontos" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "email" SET NOT NULL;

-- DropTable
DROP TABLE "conteudoUsuario";

-- DropTable
DROP TABLE "evento";

-- DropTable
DROP TABLE "eventoUsuario";

-- CreateTable
CREATE TABLE "eventos" (
    "eventoid" BIGSERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "local" VARCHAR(255) NOT NULL,
    "imagem" VARCHAR(500),
    "categoria" VARCHAR(50),
    "km" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("eventoid")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_usuario_key" ON "usuario"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");
