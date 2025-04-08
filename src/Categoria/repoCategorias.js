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
  },

  async atualizarCategoria(categoria, dados) {
    return await prisma.categoria.update({
      where: { categoriaid: parseInt(categoria) },
      data: {
        nome: dados.nome,
        imagem: dados.imagem || ""
      }
    });
  },

  async deletarCategoria(id) {
    return await prisma.categoria.delete({
      where: { categoriaid: BigInt(id) }
    });
  }
};  

export default categoria;  