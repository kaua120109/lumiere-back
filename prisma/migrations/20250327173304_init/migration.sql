-- CreateTable
CREATE TABLE "Usuario" (
    "usurioid" BIGSERIAL NOT NULL,
    "usuario" VARCHAR(20) NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "senha" VARCHAR(200) NOT NULL,
    "celular" VARCHAR(15) NOT NULL,
    "nome" VARCHAR(150) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("usurioid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_cpf_key" ON "Usuario"("cpf");
