/*
  Warnings:

  - You are about to drop the `Categoria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Endereco` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ordem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrdemProduto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pagamento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Produto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Usuario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Endereco" DROP CONSTRAINT "Endereco_usuarioid_fkey";

-- DropForeignKey
ALTER TABLE "Ordem" DROP CONSTRAINT "Ordem_enderecoid_fkey";

-- DropForeignKey
ALTER TABLE "Ordem" DROP CONSTRAINT "Ordem_usuarioid_fkey";

-- DropForeignKey
ALTER TABLE "OrdemProduto" DROP CONSTRAINT "OrdemProduto_ordemid_fkey";

-- DropForeignKey
ALTER TABLE "OrdemProduto" DROP CONSTRAINT "OrdemProduto_produtoId_fkey";

-- DropForeignKey
ALTER TABLE "Pagamento" DROP CONSTRAINT "Pagamento_ordemId_fkey";

-- DropForeignKey
ALTER TABLE "Produto" DROP CONSTRAINT "Produto_categoriaid_fkey";

-- DropTable
DROP TABLE "Categoria";

-- DropTable
DROP TABLE "Endereco";

-- DropTable
DROP TABLE "Ordem";

-- DropTable
DROP TABLE "OrdemProduto";

-- DropTable
DROP TABLE "Pagamento";

-- DropTable
DROP TABLE "Produto";

-- DropTable
DROP TABLE "Usuario";

-- CreateTable
CREATE TABLE "usuario" (
    "usuarioid" SERIAL NOT NULL,
    "usuario" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "idade" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("usuarioid")
);

-- CreateTable
CREATE TABLE "endereco" (
    "enderecoid" BIGINT NOT NULL,
    "usuarioid" INTEGER NOT NULL,
    "cidade" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "rua" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "endereco_pkey" PRIMARY KEY ("enderecoid")
);

-- CreateTable
CREATE TABLE "produto" (
    "produtoid" BIGINT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "estoque" INTEGER NOT NULL,
    "categoriaid" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produto_pkey" PRIMARY KEY ("produtoid")
);

-- CreateTable
CREATE TABLE "categoria" (
    "categoriaid" BIGINT NOT NULL,
    "nome" TEXT NOT NULL,
    "imagem" TEXT NOT NULL,

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("categoriaid")
);

-- CreateTable
CREATE TABLE "ordem" (
    "ordemid" BIGINT NOT NULL,
    "usuarioid" INTEGER NOT NULL,
    "enderecoid" BIGINT NOT NULL,
    "totalPreco" TEXT NOT NULL,
    "desconto" TEXT NOT NULL,
    "frete" TEXT NOT NULL,
    "precoFinal" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordem_pkey" PRIMARY KEY ("ordemid")
);

-- CreateTable
CREATE TABLE "ordemProduto" (
    "produtoid" BIGINT NOT NULL,
    "ordemid" BIGINT NOT NULL,
    "produtoId" BIGINT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoUnitario" TEXT NOT NULL,
    "subtotal" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordemProduto_pkey" PRIMARY KEY ("produtoid")
);

-- CreateTable
CREATE TABLE "pagamento" (
    "pagamentoid" BIGINT NOT NULL,
    "ordemId" BIGINT NOT NULL,
    "status" INTEGER NOT NULL,
    "metodo" TEXT NOT NULL,
    "transacao" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagamento_pkey" PRIMARY KEY ("pagamentoid")
);

-- CreateIndex
CREATE UNIQUE INDEX "pagamento_ordemId_key" ON "pagamento"("ordemId");

-- AddForeignKey
ALTER TABLE "endereco" ADD CONSTRAINT "endereco_usuarioid_fkey" FOREIGN KEY ("usuarioid") REFERENCES "usuario"("usuarioid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produto" ADD CONSTRAINT "produto_categoriaid_fkey" FOREIGN KEY ("categoriaid") REFERENCES "categoria"("categoriaid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordem" ADD CONSTRAINT "ordem_usuarioid_fkey" FOREIGN KEY ("usuarioid") REFERENCES "usuario"("usuarioid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordem" ADD CONSTRAINT "ordem_enderecoid_fkey" FOREIGN KEY ("enderecoid") REFERENCES "endereco"("enderecoid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordemProduto" ADD CONSTRAINT "ordemProduto_ordemid_fkey" FOREIGN KEY ("ordemid") REFERENCES "ordem"("ordemid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordemProduto" ADD CONSTRAINT "ordemProduto_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produto"("produtoid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamento" ADD CONSTRAINT "pagamento_ordemId_fkey" FOREIGN KEY ("ordemId") REFERENCES "ordem"("ordemid") ON DELETE RESTRICT ON UPDATE CASCADE;
