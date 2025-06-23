-- DropForeignKey
ALTER TABLE "ConteudoUsuario" DROP CONSTRAINT "ConteudoUsuario_conteudoid_fkey";

-- AddForeignKey
ALTER TABLE "ConteudoUsuario" ADD CONSTRAINT "ConteudoUsuario_conteudoid_fkey" FOREIGN KEY ("conteudoid") REFERENCES "conteudo"("conteudoid") ON DELETE CASCADE ON UPDATE CASCADE;
