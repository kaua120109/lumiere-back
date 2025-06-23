import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function salvarImagem({ nome_arquivo, conteudo_base64, mime_type }) {
  return prisma.imagem.create({
    data: { nome_arquivo, conteudo_base64, mime_type }
  });
}

export async function buscarImagemPorId(id) {
  return prisma.imagem.findUnique({ where: { id } });
} 