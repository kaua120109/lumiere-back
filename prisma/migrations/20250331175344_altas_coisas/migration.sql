-- AlterTable
CREATE SEQUENCE produto_produtoid_seq;
ALTER TABLE "produto" ADD COLUMN     "imagem" TEXT,
ALTER COLUMN "produtoid" SET DEFAULT nextval('produto_produtoid_seq'),
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER SEQUENCE produto_produtoid_seq OWNED BY "produto"."produtoid";
