-- CreateTable
CREATE TABLE "Imagem" (
    "id" TEXT NOT NULL,
    "nome_arquivo" TEXT NOT NULL,
    "conteudo_base64" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Imagem_pkey" PRIMARY KEY ("id")
);
