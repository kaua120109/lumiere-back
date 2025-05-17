-- CreateTable
CREATE TABLE "historia" (
    "historiaId" BIGSERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "imagem" TEXT,
    "usuarioId" INTEGER NOT NULL,
    "categoria" TEXT,
    "esporte" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "historia_pkey" PRIMARY KEY ("historiaId")
);

-- CreateTable
CREATE TABLE "comentario" (
    "comentarioId" BIGSERIAL NOT NULL,
    "conteudo" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "historiaId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comentario_pkey" PRIMARY KEY ("comentarioId")
);

-- AddForeignKey
ALTER TABLE "historia" ADD CONSTRAINT "historia_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("usuarioid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentario" ADD CONSTRAINT "comentario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("usuarioid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentario" ADD CONSTRAINT "comentario_historiaId_fkey" FOREIGN KEY ("historiaId") REFERENCES "historia"("historiaId") ON DELETE RESTRICT ON UPDATE CASCADE;
