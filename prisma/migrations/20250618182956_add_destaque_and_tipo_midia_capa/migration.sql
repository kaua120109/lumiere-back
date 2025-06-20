-- AlterTable
ALTER TABLE "conteudo" ADD COLUMN     "destaque" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tipoMidiaCapa" TEXT NOT NULL DEFAULT 'imagem';
