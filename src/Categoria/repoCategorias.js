import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const categoria = {
  async listaCategorias() {
    return await prisma.categoria.findMany({
      select: {
        categoriaid: true,
        nome: true,
        imagem: true,
      },
    })
  },

  async criarCategoria(dados) {
    console.log("Criando categoria com dados:", {
      nome: dados.nome,
      imagem: dados.imagem ? "Base64 image data (truncated)" : null,
    })

    return await prisma.categoria.create({
      data: {
        nome: dados.nome,
        imagem: dados.imagem || null,
      },
    })
  },

  async atualizarCategoria(categoriaId, dados) {
    // Criar objeto de dados para atualização
    const updateData = {
      nome: dados.nome,
    }

    // Adicionar imagem apenas se estiver definida
    if (dados.imagem !== undefined) {
      updateData.imagem = dados.imagem
    }

    return await prisma.categoria.update({
      where: { categoriaid: BigInt(categoriaId) },
      data: updateData,
    })
  },

  async deletarCategoria(id) {
    return await prisma.categoria.delete({
      where: { categoriaid: BigInt(id) },
    })
  },
}

export default categoria
