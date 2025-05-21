import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const produto = {
  // Método para listar produtos com base na pesquisa
  async listarProdutos(query = "") {
    try {
      // Se não houver query, busca todos os produtos sem filtro
      if (!query) {
        const produtos = await prisma.produto.findMany({
          select: {
            produtoid: true,
            nome: true,
            descricao: true,
            preco: true,
            estoque: true,
            imagem: true,
            categoria: true,
          },
        })
        return produtos
      }

      // Se houver query, aplica o filtro
      const produtos = await prisma.produto.findMany({
        where: {
          OR: [
            { nome: { contains: query, mode: "insensitive" } },
            { descricao: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          produtoid: true,
          nome: true,
          descricao: true,
          preco: true,
          estoque: true,
          imagem: true,
          categoria: true,
        },
      })
      return produtos
    } catch (error) {
      console.error("Erro ao listar produtos:", error)
      throw new Error("Erro ao listar produtos")
    }
  },

  // Método modificado para aceitar imagem base64 diretamente
  async criarProduto(dados) {
    console.log("Dados recebidos no repositório:", {
      ...dados,
      imagem: dados.imagem ? "Base64 image data (truncated)" : null,
    })

    return await prisma.produto.create({
      data: {
        nome: dados.nome,
        descricao: dados.descricao,
        preco: Number.parseFloat(dados.preco),
        estoque: Number.parseInt(dados.estoque),
        imagem: dados.imagem ?? null, // Agora armazena diretamente o base64
        categoria: {
          connect: {
            categoriaid: Number.parseInt(dados.categoriaid),
          },
        },
      },
    })
  },

  async atualizarProduto(id, dados) {
    // Create the update data object
    const updateData = {
      nome: dados.nome,
      descricao: dados.descricao,
      preco: Number.parseFloat(dados.preco),
      estoque: Number.parseInt(dados.estoque),
    }

    // Only add the image if it exists
    if (dados.imagem !== undefined) {
      updateData.imagem = dados.imagem // Agora armazena diretamente o base64
    }

    // Only connect to category if categoriaid exists
    if (dados.categoriaid) {
      updateData.categoria = {
        connect: {
          categoriaid: Number.parseInt(dados.categoriaid),
        },
      }
    }

    return await prisma.produto.update({
      where: {
        produtoid: Number.parseInt(id),
      },
      data: updateData,
    })
  },

  // Método corrigido para receber diretamente o ID como número
  async deletarProduto(id) {
    return await prisma.produto.delete({
      where: {
        produtoid: id, // ID já é um número
      },
    })
  },
}
