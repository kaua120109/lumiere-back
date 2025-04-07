-- AlterTable
CREATE SEQUENCE categoria_categoriaid_seq;
ALTER TABLE "categoria" ALTER COLUMN "categoriaid" SET DEFAULT nextval('categoria_categoriaid_seq');
ALTER SEQUENCE categoria_categoriaid_seq OWNED BY "categoria"."categoriaid";

-- AlterTable
CREATE SEQUENCE endereco_enderecoid_seq;
ALTER TABLE "endereco" ALTER COLUMN "enderecoid" SET DEFAULT nextval('endereco_enderecoid_seq');
ALTER SEQUENCE endereco_enderecoid_seq OWNED BY "endereco"."enderecoid";

-- AlterTable
CREATE SEQUENCE ordem_ordemid_seq;
ALTER TABLE "ordem" ALTER COLUMN "ordemid" SET DEFAULT nextval('ordem_ordemid_seq');
ALTER SEQUENCE ordem_ordemid_seq OWNED BY "ordem"."ordemid";

-- AlterTable
CREATE SEQUENCE ordemproduto_produtoid_seq;
ALTER TABLE "ordemProduto" ALTER COLUMN "produtoid" SET DEFAULT nextval('ordemproduto_produtoid_seq');
ALTER SEQUENCE ordemproduto_produtoid_seq OWNED BY "ordemProduto"."produtoid";

-- AlterTable
CREATE SEQUENCE pagamento_pagamentoid_seq;
ALTER TABLE "pagamento" ALTER COLUMN "pagamentoid" SET DEFAULT nextval('pagamento_pagamentoid_seq');
ALTER SEQUENCE pagamento_pagamentoid_seq OWNED BY "pagamento"."pagamentoid";
