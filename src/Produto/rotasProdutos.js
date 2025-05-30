import { Router } from "express"
import { produto } from "./repoProdutos.js"
import { verificarAutenticacao } from "../middleware/auth.js"

const router = Router()

// Rota para listar produtos - agora com pesquisa
router.get("/pesquisar", verificarAutenticacao, async (req, res) => {
  const query = req.query.q || ""

  try {
    const produtos = await produto.listarProdutos(query)
    res.status(200).json(produtos)
  } catch (error) {
    console.error("Erro ao pesquisar produtos:", error)
    res.status(500).json({ message: error.message })
  }
})

// Rota para listar produtos
router.get("/lista-produtos", verificarAutenticacao, async (req, res) => {
  try {
    const response = await produto.listarProdutos()
    res.status(200).json(response)
  } catch (error) {
    console.error("Erro ao listar produtos:", error)
    res.status(500).json({ message: error.message })
  }
})

// Nova rota para listar produtos em oferta
router.get("/ofertas", async (req, res) => {
  try {
    const produtosEmOferta = await produto.listarProdutosEmOferta()
    res.status(200).json(produtosEmOferta)
  } catch (error) {
    console.error("Erro ao listar produtos em oferta:", error)
    res.status(500).json({ message: error.message })
  }
})

// Rota para adicionar produto
router.post("/adicionar", verificarAutenticacao, async (req, res) => {
  try {
    const dados = req.body
    const novoProduto = await produto.criarProduto(dados)
    res.status(201).json(novoProduto)
  } catch (error) {
    console.error("Erro ao adicionar produto:", error)
    res.status(500).json({ error: error.message })
  }
})

// Rota para atualizar produto
router.post("/atualizar/:id", verificarAutenticacao, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id)
    const dados = req.body

    const atualizado = await produto.atualizarProduto(id, dados)
    res.status(200).json(atualizado)
  } catch (error) {
    console.error("Erro ao atualizar produto:", error)
    res.status(500).json({ message: error.message })
  }
})

// Nova rota para aplicar oferta em lote
router.post("/ofertas/aplicar-lote", verificarAutenticacao, async (req, res) => {
  try {
    const { produtoIds, dadosOferta } = req.body
    
    if (!produtoIds || !Array.isArray(produtoIds) || produtoIds.length === 0) {
      return res.status(400).json({ error: "IDs dos produtos são obrigatórios" })
    }

    const resultado = await produto.aplicarOfertaLote(produtoIds, dadosOferta)
    res.status(200).json(resultado)
  } catch (error) {
    console.error("Erro ao aplicar oferta em lote:", error)
    res.status(500).json({ error: error.message })
  }
})

// Nova rota para remover ofertas expiradas
router.post("/ofertas/remover-expiradas", verificarAutenticacao, async (req, res) => {
  try {
    const resultado = await produto.removerOfertasExpiradas()
    res.status(200).json(resultado)
  } catch (error) {
    console.error("Erro ao remover ofertas expiradas:", error)
    res.status(500).json({ error: error.message })
  }
})

// Rota para deletar produto
router.post("/deletar/:id", verificarAutenticacao, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id)
    await produto.deletarProduto(id)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router