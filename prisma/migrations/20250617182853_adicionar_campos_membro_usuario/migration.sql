-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "ehMembro" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "membroAtivo" BOOLEAN NOT NULL DEFAULT false;
