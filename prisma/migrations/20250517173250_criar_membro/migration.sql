-- CreateTable
CREATE TABLE "membro" (
    "membroId" BIGSERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "plano" TEXT NOT NULL DEFAULT 'gratuito',
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataExpiracao" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "beneficios" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membro_pkey" PRIMARY KEY ("membroId")
);

-- CreateIndex
CREATE UNIQUE INDEX "membro_usuarioId_key" ON "membro"("usuarioId");

-- AddForeignKey
ALTER TABLE "membro" ADD CONSTRAINT "membro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("usuarioid") ON DELETE RESTRICT ON UPDATE CASCADE;
