import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const produto = {
  async listarProdutos() {
    return await prisma.produto.findMany({
      select: {
        produtoid: true,
        nome: true,
        descricao: true,
        preco: true,
        estoque: true,
        imagem: true,
        categoria: true
      }
    });
  },

  async criarProduto(dados) {
    return await prisma.produto.create({
      data: {
        nome: dados.nome,
        descricao: dados.descricao,
        preco: parseFloat(dados.preco),
        estoque: parseInt(dados.estoque),
        categoriaid: parseInt(dados.categoriaid)
      }
    });
  }
};