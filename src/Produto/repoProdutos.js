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
        estoque: Number.parseInt(dados.estoque),
        imagem: dados.imagem ?? null,
        imagensAdicionais: dados.imagensAdicionais || [],
        cores: dados.cores || [],
        tamanhos: dados.tamanhos || [],
        categoria: {
          connect: {
            categoriaid: Number.parseInt(dados.categoriaid),
          },
        },
      },
      include: {
        categoria: true, // Incluir o objeto categoria na resposta
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

    // Campos de oferta
    if (dados.precoOriginal !== undefined) {
      updateData.precoOriginal = dados.precoOriginal ? Number.parseFloat(dados.precoOriginal) : null
    }
    
    if (dados.porcentagemDesconto !== undefined) {
      updateData.porcentagemDesconto = dados.porcentagemDesconto ? Number.parseInt(dados.porcentagemDesconto) : null
    }
    
    if (dados.emOferta !== undefined) {
      updateData.emOferta = dados.emOferta
    }
    
    if (dados.dataInicioOferta !== undefined) {
      updateData.dataInicioOferta = dados.dataInicioOferta ? new Date(dados.dataInicioOferta) : null
    }
    
    if (dados.dataFimOferta !== undefined) {
      updateData.dataFimOferta = dados.dataFimOferta ? new Date(dados.dataFimOferta) : null
    }

    // Campos de arrays
    if (dados.imagensAdicionais !== undefined) {
      updateData.imagensAdicionais = dados.imagensAdicionais
    }
    
    if (dados.cores !== undefined) {
      updateData.cores = dados.cores
    }
    
    if (dados.tamanhos !== undefined) {
      updateData.tamanhos = dados.tamanhos
    }

    // Only add the image if it exists
    if (dados.imagem !== undefined) {
      updateData.imagem = dados.imagem
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
      include: {
        categoria: true, // Incluir o objeto categoria na resposta
      },
    })
  },

  // Método para buscar produtos em oferta
  async listarProdutosEmOferta() {
    try {
      const agora = new Date()
      
      const produtos = await prisma.produto.findMany({
        where: {
          emOferta: true,
          OR: [
            { dataFimOferta: null }, // Ofertas sem data de fim
            { dataFimOferta: { gte: agora } } // Ofertas que ainda não expiraram
          ]
        },
        include: {
          categoria: true,
        },
        orderBy: {
          porcentagemDesconto: 'desc' // Ordenar por maior desconto
        }
      })
      
      return produtos
    } catch (error) {
      console.error("Erro ao listar produtos em oferta:", error)
      throw new Error("Erro ao listar produtos em oferta")
    }
  },

  // Método para aplicar oferta em lote
  async aplicarOfertaLote(produtoIds, dadosOferta) {
    try {
      const updateData = {
        emOferta: true,
        precoOriginal: dadosOferta.precoOriginal ? Number.parseFloat(dadosOferta.precoOriginal) : undefined,
        porcentagemDesconto: dadosOferta.porcentagemDesconto ? Number.parseInt(dadosOferta.porcentagemDesconto) : undefined,
        dataInicioOferta: dadosOferta.dataInicioOferta ? new Date(dadosOferta.dataInicioOferta) : undefined,
        dataFimOferta: dadosOferta.dataFimOferta ? new Date(dadosOferta.dataFimOferta) : undefined,
      }

      // Calcular novo preço se houver desconto
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
          emOferta: false
        }
      })

      return resultado
    } catch (error) {
      console.error("Erro ao remover ofertas expiradas:", error)
      throw new Error("Erro ao remover ofertas expiradas")
    }
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