-- CreateTable
CREATE TABLE "usuario" (
    "usuarioid" SERIAL NOT NULL,
    "usuario" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT,
    "celular" TEXT,
    "senha" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "googleId" TEXT,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("usuarioid")
);

-- CreateTable
CREATE TABLE "endereco" (
    "enderecoid" BIGSERIAL NOT NULL,
    "usuarioid" INTEGER NOT NULL,
    "cidade" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "rua" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "endereco_pkey" PRIMARY KEY ("enderecoid")
);

-- CreateTable
CREATE TABLE "categoria" (
    "categoriaid" BIGSERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "imagem" TEXT,

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("categoriaid")
);

-- CreateTable
CREATE TABLE "produto" (
    "produtoid" BIGSERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "estoque" INTEGER NOT NULL,
    "categoriaid" BIGINT NOT NULL,
    "imagem" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produto_pkey" PRIMARY KEY ("produtoid")
);

-- CreateTable
CREATE TABLE "ordem" (
    "ordemid" BIGSERIAL NOT NULL,
    "usuarioid" INTEGER NOT NULL,
    "enderecoid" BIGINT NOT NULL,
    "totalPreco" DECIMAL(10,2) NOT NULL,
    "desconto" DECIMAL(10,2) NOT NULL,
    "frete" DECIMAL(10,2) NOT NULL,
    "precoFinal" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ordem_pkey" PRIMARY KEY ("ordemid")
);

-- CreateTable
CREATE TABLE "ordemProduto" (
    "id" BIGSERIAL NOT NULL,
    "ordemid" BIGINT NOT NULL,
    "produtoid" BIGINT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoUnitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ordemProduto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamento" (
    "pagamentoid" BIGSERIAL NOT NULL,
    "ordemid" BIGINT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "status" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioid" INTEGER NOT NULL,
    "transacao" TEXT NOT NULL,
    "formaPagamento" TEXT NOT NULL,
    "cartao" TEXT,
    "parcelas" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagamento_pkey" PRIMARY KEY ("pagamentoid")
);

-- CreateTable
CREATE TABLE "historia" (
    "historiaid" BIGSERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "imagem" TEXT,
    "usuarioid" INTEGER NOT NULL,
    "categoria" TEXT,
    "esporte" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historia_pkey" PRIMARY KEY ("historiaid")
);

-- CreateTable
CREATE TABLE "comentario" (
    "comentarioid" BIGSERIAL NOT NULL,
    "conteudo" TEXT NOT NULL,
    "usuarioid" INTEGER NOT NULL,
    "historiaid" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comentario_pkey" PRIMARY KEY ("comentarioid")
);

-- CreateTable
CREATE TABLE "membro" (
    "membroid" BIGSERIAL NOT NULL,
    "usuarioid" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataExpiracao" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "beneficios" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membro_pkey" PRIMARY KEY ("membroid")
);

-- CreateTable
CREATE TABLE "promocao" (
    "promocaoid" BIGSERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "desconto" DECIMAL(10,2) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "validade" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promocao_pkey" PRIMARY KEY ("promocaoid")
);

-- CreateTable
CREATE TABLE "oferta" (
    "ofertaid" BIGSERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "imagem" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oferta_pkey" PRIMARY KEY ("ofertaid")
);

-- CreateTable
CREATE TABLE "conteudo" (
    "conteudoid" BIGSERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "imagem" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conteudo_pkey" PRIMARY KEY ("conteudoid")
);

-- CreateTable
CREATE TABLE "evento" (
    "eventoid" BIGSERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "local" TEXT NOT NULL,
    "imagem" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evento_pkey" PRIMARY KEY ("eventoid")
);

-- CreateTable
CREATE TABLE "recompensa" (
    "recompensaid" BIGSERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "imagem" TEXT,
    "pontos" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recompensa_pkey" PRIMARY KEY ("recompensaid")
);

-- CreateTable
CREATE TABLE "ofertaUsuario" (
    "id" BIGSERIAL NOT NULL,
    "usuarioid" INTEGER NOT NULL,
    "ofertaid" BIGINT NOT NULL,
    "visualizado" BOOLEAN NOT NULL DEFAULT false,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ofertaUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conteudoUsuario" (
    "id" BIGSERIAL NOT NULL,
    "usuarioid" INTEGER NOT NULL,
    "conteudoid" BIGINT NOT NULL,
    "acessadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conteudoUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventoUsuario" (
    "id" BIGSERIAL NOT NULL,
    "usuarioid" INTEGER NOT NULL,
    "eventoid" BIGINT NOT NULL,
    "inscrito" BOOLEAN NOT NULL DEFAULT true,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventoUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_googleId_key" ON "usuario"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "pagamento_ordemid_key" ON "pagamento"("ordemid");

-- CreateIndex
CREATE UNIQUE INDEX "membro_usuarioid_key" ON "membro"("usuarioid");

-- CreateIndex
CREATE UNIQUE INDEX "promocao_codigo_key" ON "promocao"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "ofertaUsuario_usuarioid_ofertaid_key" ON "ofertaUsuario"("usuarioid", "ofertaid");

-- CreateIndex
CREATE UNIQUE INDEX "conteudoUsuario_usuarioid_conteudoid_key" ON "conteudoUsuario"("usuarioid", "conteudoid");

-- CreateIndex
CREATE UNIQUE INDEX "eventoUsuario_usuarioid_eventoid_key" ON "eventoUsuario"("usuarioid", "eventoid");

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
ALTER TABLE "ordemProduto" ADD CONSTRAINT "ordemProduto_produtoid_fkey" FOREIGN KEY ("produtoid") REFERENCES "produto"("produtoid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamento" ADD CONSTRAINT "pagamento_ordemid_fkey" FOREIGN KEY ("ordemid") REFERENCES "ordem"("ordemid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamento" ADD CONSTRAINT "pagamento_usuarioid_fkey" FOREIGN KEY ("usuarioid") REFERENCES "usuario"("usuarioid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historia" ADD CONSTRAINT "historia_usuarioid_fkey" FOREIGN KEY ("usuarioid") REFERENCES "usuario"("usuarioid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentario" ADD CONSTRAINT "comentario_usuarioid_fkey" FOREIGN KEY ("usuarioid") REFERENCES "usuario"("usuarioid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentario" ADD CONSTRAINT "comentario_historiaid_fkey" FOREIGN KEY ("historiaid") REFERENCES "historia"("historiaid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membro" ADD CONSTRAINT "membro_usuarioid_fkey" FOREIGN KEY ("usuarioid") REFERENCES "usuario"("usuarioid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ofertaUsuario" ADD CONSTRAINT "ofertaUsuario_usuarioid_fkey" FOREIGN KEY ("usuarioid") REFERENCES "usuario"("usuarioid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ofertaUsuario" ADD CONSTRAINT "ofertaUsuario_ofertaid_fkey" FOREIGN KEY ("ofertaid") REFERENCES "oferta"("ofertaid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conteudoUsuario" ADD CONSTRAINT "conteudoUsuario_usuarioid_fkey" FOREIGN KEY ("usuarioid") REFERENCES "usuario"("usuarioid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conteudoUsuario" ADD CONSTRAINT "conteudoUsuario_conteudoid_fkey" FOREIGN KEY ("conteudoid") REFERENCES "conteudo"("conteudoid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventoUsuario" ADD CONSTRAINT "eventoUsuario_usuarioid_fkey" FOREIGN KEY ("usuarioid") REFERENCES "usuario"("usuarioid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventoUsuario" ADD CONSTRAINT "eventoUsuario_eventoid_fkey" FOREIGN KEY ("eventoid") REFERENCES "evento"("eventoid") ON DELETE RESTRICT ON UPDATE CASCADE;
