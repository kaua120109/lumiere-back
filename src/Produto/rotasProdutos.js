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

// Rota para obter um produto por ID
router.get("/api/produtos/:id", async (req, res) => {
  try {
    const produtoEncontrado = await produto.obterProdutoPorId(req.params.id)
    res.status(200).json(produtoEncontrado)
  } catch (error) {
    console.error("Erro ao obter produto por ID:", error)
    res.status(500).json({ message: error.message })
  }
})

// Rota para criar um produto
router.post("/produtos", verificarAutenticacao, async (req, res) => {
  try {
    const novoProduto = await produto.criarProduto(req.body)
    res.status(201).json(novoProduto)
  } catch (error) {
    console.error("Erro ao criar produto:", error)
    res.status(500).json({ message: error.message })
  }
})

// Rota para atualizar um produto
router.put("/atualizar/:id", verificarAutenticacao, async (req, res) => {
  try {
    const produtoAtualizado = await produto.atualizarProduto(req.params.id, req.body)
    res.status(200).json(produtoAtualizado)
  } catch (error) {
    console.error("Erro ao atualizar produto:", error)
    res.status(500).json({ message: error.message })
  }
})

// Rota para deletar um produto
router.delete("/api/produtos/:id", verificarAutenticacao, async (req, res) => {
  try {
    const resultado = await produto.deletarProduto(req.params.id)
    res.status(200).json(resultado)
  } catch (error) {
    console.error("Erro ao deletar produto:", error)
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
router.post("ofertas/remover-expiradas", verificarAutenticacao, async (req, res) => {
  try {
    const resultado = await produto.removerOfertasExpiradas()
    res.status(200).json(resultado)
  } catch (error) {
    console.error("Erro ao remover ofertas expiradas:", error)
    res.status(500).json({ error: error.message })
  }
})

export default router