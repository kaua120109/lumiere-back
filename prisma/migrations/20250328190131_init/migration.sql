/*
  Warnings:

  - The primary key for the `Usuario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `celular` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `usurioid` on the `Usuario` table. All the data in the column will be lost.
  - Added the required column `createdAt` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idade` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefone` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioid` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Usuario_cpf_key";

-- AlterTable
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_pkey",
DROP COLUMN "celular",
DROP COLUMN "usurioid",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "idade" INTEGER NOT NULL,
ADD COLUMN     "telefone" TEXT NOT NULL,
ADD COLUMN     "usuarioid" BIGINT NOT NULL,
ALTER COLUMN "usuario" SET DATA TYPE TEXT,
ALTER COLUMN "cpf" SET DATA TYPE TEXT,
ALTER COLUMN "senha" SET DATA TYPE TEXT,
ALTER COLUMN "nome" SET DATA TYPE TEXT,
ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY ("usuarioid");

-- CreateTable
CREATE TABLE "Endereco" (
    "enderecoid" BIGINT NOT NULL,
    "usuarioid" BIGINT NOT NULL,
    "cidade" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "rua" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Endereco_pkey" PRIMARY KEY ("enderecoid")
);

-- CreateTable
CREATE TABLE "Produto" (
    "produtoid" BIGINT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "estoque" INTEGER NOT NULL,
    "categoriaid" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("produtoid")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "categoriaid" BIGINT NOT NULL,
    "nome" TEXT NOT NULL,
    "imagem" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("categoriaid")
);

-- CreateTable
CREATE TABLE "Ordem" (
    "ordemid" BIGINT NOT NULL,
    "usuarioid" BIGINT NOT NULL,
    "enderecoid" BIGINT NOT NULL,
    "totalPreco" TEXT NOT NULL,
    "desconto" TEXT NOT NULL,
    "frete" TEXT NOT NULL,
    "precoFinal" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ordem_pkey" PRIMARY KEY ("ordemid")
);

-- CreateTable
CREATE TABLE "OrdemProduto" (
    "produtoid" BIGINT NOT NULL,
    "ordemid" BIGINT NOT NULL,
    "produtoId" BIGINT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoUnitario" TEXT NOT NULL,
    "subtotal" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrdemProduto_pkey" PRIMARY KEY ("produtoid")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "pagamentoid" BIGINT NOT NULL,
    "ordemId" BIGINT NOT NULL,
    "status" INTEGER NOT NULL,
    "metodo" TEXT NOT NULL,
    "transacao" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("pagamentoid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pagamento_ordemId_key" ON "Pagamento"("ordemId");

-- AddForeignKey
ALTER TABLE "Endereco" ADD CONSTRAINT "Endereco_usuarioid_fkey" FOREIGN KEY ("usuarioid") REFERENCES "Usuario"("usuarioid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_categoriaid_fkey" FOREIGN KEY ("categoriaid") REFERENCES "Categoria"("categoriaid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ordem" ADD CONSTRAINT "Ordem_usuarioid_fkey" FOREIGN KEY ("usuarioid") REFERENCES "Usuario"("usuarioid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ordem" ADD CONSTRAINT "Ordem_enderecoid_fkey" FOREIGN KEY ("enderecoid") REFERENCES "Endereco"("enderecoid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemProduto" ADD CONSTRAINT "OrdemProduto_ordemid_fkey" FOREIGN KEY ("ordemid") REFERENCES "Ordem"("ordemid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemProduto" ADD CONSTRAINT "OrdemProduto_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("produtoid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_ordemId_fkey" FOREIGN KEY ("ordemId") REFERENCES "Ordem"("ordemid") ON DELETE RESTRICT ON UPDATE CASCADE;
