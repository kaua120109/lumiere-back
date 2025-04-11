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
    console.log("Dados recebidos no repositório:", dados);
    return await prisma.produto.create({
      data: {
        nome: dados.nome,
        descricao: dados.descricao,
        preco: parseFloat(dados.preco),       // ✅ conversão correta
        estoque: parseInt(dados.estoque),    // ✅ conversão correta
        imagem: dados.imagem ?? null,       // ✅ trata imagem opcional
        categoria: {
          connect: {
            categoriaid: parseInt(dados.categoriaid)
          }
        }
      }
    });
  },

  async atualizarProduto(id, dados) {
    return await prisma.produto.update({
      where: {
        produtoid: parseInt(id)
      },
      data: {
        nome: dados.nome,
        descricao: dados.descricao,
        preco: parseFloat(dados.preco),
        estoque: parseInt(dados.estoque),
        imagem: dados.imagem ?? null,
        categoria: {
          connect: {
            categoriaid: parseInt(dados.categoriaid)
          }
        }
      }
    });
  },
  
  async deletarProduto(produtoid) {
    return await prisma.produto.delete({
      where: {
        produtoid: parseInt(produtoid.id)
      }
    });
  }
};
