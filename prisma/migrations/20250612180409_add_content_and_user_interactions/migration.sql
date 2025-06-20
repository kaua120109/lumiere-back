-- AlterTable
ALTER TABLE "conteudo" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "duracao" TEXT;

-- CreateTable
CREATE TABLE "ConteudoUsuario" (
    "usuarioid" INTEGER NOT NULL,
    "conteudoid" BIGINT NOT NULL,
    "visualizado" BOOLEAN NOT NULL DEFAULT false,
    "favoritado" BOOLEAN NOT NULL DEFAULT false,
    "progresso" INTEGER NOT NULL DEFAULT 0,
    "assignadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConteudoUsuario_pkey" PRIMARY KEY ("usuarioid","conteudoid")
);

-- AddForeignKey
ALTER TABLE "ConteudoUsuario" ADD CONSTRAINT "ConteudoUsuario_usuarioid_fkey" FOREIGN KEY ("usuarioid") REFERENCES "usuario"("usuarioid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConteudoUsuario" ADD CONSTRAINT "ConteudoUsuario_conteudoid_fkey" FOREIGN KEY ("conteudoid") REFERENCES "conteudo"("conteudoid") ON DELETE RESTRICT ON UPDATE CASCADE;
