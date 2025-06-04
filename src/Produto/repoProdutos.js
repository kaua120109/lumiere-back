import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const produto = {
  // Método para listar produtos com base na pesquisa
  async listarProdutos(query = "") {
    try {
      // Se não houver query, busca todos os produtos sem filtro
      if (!query) {
        const produtos = await prisma.produto.findMany({
          include: {
            categoria: true, // Incluir o objeto categoria completo
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
        include: {
          categoria: true, // Incluir o objeto categoria completo
        },
      })
      return produtos
    } catch (error) {
      console.error("Erro ao listar produtos:", error)
      throw new Error("Erro ao listar produtos")
    }
  },

  // Método modificado para aceitar campos de oferta
  async criarProduto(dados) {
    return await prisma.produto.create({
      data: {
        nome: dados.nome,
        descricao: dados.descricao,
        preco: Number.parseFloat(dados.preco),
        precoOriginal: dados.precoOriginal ? Number.parseFloat(dados.precoOriginal) : null,
        porcentagemDesconto: dados.porcentagemDesconto ? Number.parseInt(dados.porcentagemDesconto) : null,
        emOferta: dados.emOferta || false,
        dataInicioOferta: dados.dataInicioOferta ? new Date(dados.dataInicioOferta) : null,
        dataFimOferta: dados.dataFimOferta ? new Date(dados.dataFimOferta) : null,
        estoque: dados.estoque,
        categoriaid: BigInt(dados.categoriaid),
        imagem: dados.imagem || null,
        imagensAdicionais: dados.imagensAdicionais || [],
        cores: dados.cores || [],
        tamanhos: dados.tamanhos || [],
      },
    })
  },

  async obterProdutoPorId(id) {
    try {
      const produtoEncontrado = await prisma.produto.findUnique({
        where: { produtoid: BigInt(id) },
        include: {
          categoria: true, // Incluir o objeto categoria completo
        },
      })
      if (!produtoEncontrado) {
        throw new Error("Produto não encontrado")
      }
      return produtoEncontrado
    } catch (error) {
      console.error("Erro ao obter produto por ID:", error)
      throw new Error("Erro ao obter produto")
    }
  },

  async atualizarProduto(id, dados) {
    try {
      const produtoAtualizado = await prisma.produto.update({
        where: { produtoid: BigInt(id) },
        data: {
          nome: dados.nome,
          descricao: dados.descricao,
          preco: Number.parseFloat(dados.preco),
          precoOriginal: dados.precoOriginal ? Number.parseFloat(dados.precoOriginal) : null,
          porcentagemDesconto: dados.porcentagemDesconto ? Number.parseInt(dados.porcentagemDesconto) : null,
          emOferta: dados.emOferta || false,
          dataInicioOferta: dados.dataInicioOferta ? new Date(dados.dataInicioOferta) : null,
          dataFimOferta: dados.dataFimOferta ? new Date(dados.dataFimOferta) : null,
          estoque: dados.estoque,
          categoriaid: BigInt(dados.categoriaid),
          imagem: dados.imagem || null,
          imagensAdicionais: dados.imagensAdicionais || [],
          cores: dados.cores || [],
          tamanhos: dados.tamanhos || [],
        },
      })
      return produtoAtualizado
    } catch (error) {
      console.error("Erro ao atualizar produto:", error)
      throw new Error("Erro ao atualizar produto")
    }
  },

  async deletarProduto(id) {
    try {
      await prisma.produto.delete({
        where: { produtoid: BigInt(id) },
      })
      return { message: "Produto deletado com sucesso" }
    } catch (error) {
      console.error("Erro ao deletar produto:", error)
      throw new Error("Erro ao deletar produto")
    }
  },

  // Novo método para listar produtos em oferta
  async listarProdutosEmOferta() {
    try {
      const agora = new Date()
      const produtosEmOferta = await prisma.produto.findMany({
        where: {
          emOferta: true,
          dataInicioOferta: {
            lte: agora,
          },
          dataFimOferta: {
            gte: agora,
          },
        },
        include: {
          categoria: true,
        },
      })
      return produtosEmOferta
    } catch (error) {
      console.error("Erro ao listar produtos em oferta:", error)
      throw new Error("Erro ao listar produtos em oferta")
    }
  },

  // Novo método para aplicar oferta em lote
  async aplicarOfertaLote(produtoIds, dadosOferta) {
    try {
      const updateData = {
        emOferta: true,
        dataInicioOferta: dadosOferta.dataInicioOferta ? new Date(dadosOferta.dataInicioOferta) : new Date(),
        dataFimOferta: dadosOferta.dataFimOferta ? new Date(dadosOferta.dataFimOferta) : null,
        porcentagemDesconto: dadosOferta.porcentagemDesconto ? Number.parseInt(dadosOferta.porcentagemDesconto) : null,
      }

      // Se precoOriginal e porcentagemDesconto forem fornecidos, calcula o novo preço
      if (dadosOferta.precoOriginal && dadosOferta.porcentagemDesconto) {
        const precoOriginal = Number.parseFloat(dadosOferta.precoOriginal)
        const desconto = Number.parseInt(dadosOferta.porcentagemDesconto)
        updateData.preco = precoOriginal * (1 - desconto / 100)
      }

      const resultado = await prisma.produto.updateMany({
        where: {
          produtoid: {
            in: produtoIds.map(id => Number.parseInt(id))
          }
        },
        data: updateData
      })

      return resultado
    } catch (error) {
      console.error("Erro ao aplicar oferta em lote:", error)
      throw new Error("Erro ao aplicar oferta em lote")
    }
  },

  // Método para remover ofertas expiradas
  async removerOfertasExpiradas() {
    try {
      const agora = new Date()
      
      const resultado = await prisma.produto.updateMany({
        where: {
          emOferta: true,
          dataFimOferta: {
            lt: agora
          }
        },
        data: {
          emOferta: false,
          precoOriginal: null, // Limpa o preço original quando a oferta expira
          porcentagemDesconto: null, // Limpa a porcentagem de desconto
          dataInicioOferta: null,
          dataFimOferta: null,
        }
      })

      return resultado
    } catch (error) {
      console.error("Erro ao remover ofertas expiradas:", error)
      throw new Error("Erro ao remover ofertas expiradas")
    }
  },
}