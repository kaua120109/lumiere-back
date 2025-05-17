/*
  Warnings:

  - You are about to drop the column `metodo` on the `pagamento` table. All the data in the column will be lost.
  - Added the required column `formaPagamento` to the `pagamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parcelas` to the `pagamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioid` to the `pagamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valor` to the `pagamento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pagamento" DROP COLUMN "metodo",
ADD COLUMN     "cartao" TEXT,
ADD COLUMN     "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "formaPagamento" TEXT NOT NULL,
ADD COLUMN     "parcelas" INTEGER NOT NULL,
ADD COLUMN     "usuarioid" BIGINT NOT NULL,
ADD COLUMN     "valor" TEXT NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;
