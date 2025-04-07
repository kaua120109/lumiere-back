import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const categoria = {
  async listaCategorias() {
    return await prisma.categoria.findMany({
      select: {
        categoriaid: true,
        nome: true,
        imagem: true
      }
    });
  },

  async criarCategoria(dados) {
    console.log("bunda", dados);
    return await prisma.categoria.create({
      data: {
        nome: dados.nome,
        imagem: dados.imagem || ""
      }
    });
  }
};