import { Router } from "express"
import { produto } from "./repoProdutos.js"
import { verificarAutenticacao } from "../middleware/auth.js"

const router = Router()

// Rota para listar produtos - agora com pesquisa
router.get("/pesquisar", verificarAutenticacao, async (req, res) => {
  const query = req.query.q || "" // Captura o parâmetro de busca 'q', se não houver, busca todos os produtos.

  try {
    const produtos = await produto.listarProdutos(query) // Passa a query para o repositório
    res.status(200).json(produtos)
  } catch (error) {
    console.error("Erro ao pesquisar produtos:", error)
    res.status(500).json({ message: error.message })
  }
})

// Rota para listar produtos - agora com autenticação
router.get("/lista-produtos", verificarAutenticacao, async (req, res) => {
  try {
    const response = await produto.listarProdutos()
    res.status(200).json(response)
  } catch (error) {
    console.error("Erro ao listar produtos:", error)
    res.status(500).json({ message: error.message })
  }
})

// Rota para adicionar produto - agora aceitando base64
router.post("/adicionar", verificarAutenticacao, async (req, res) => {
  try {
    console.log("Dados recebidos:", {
      ...req.body,
      imagem: req.body.imagem ? "Base64 image data (truncated)" : null,
    })

    const dados = req.body
    // A imagem já vem como base64 do frontend

    const novoProduto = await produto.criarProduto(dados)
    res.status(201).json(novoProduto)
  } catch (error) {
    console.error("Erro ao adicionar produto:", error)
    res.status(500).json({ error: error.message })
  }
})

// Rota para atualizar produto - agora aceitando base64
router.post("/atualizar/:id", verificarAutenticacao, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id)
    const { nome, descricao, preco, estoque, categoriaid, imagem } = req.body

    // Make sure categoriaid is not undefined before passing it
    const dados = {
      nome,
      descricao,
      preco: Number.parseFloat(preco),
      estoque: Number.parseInt(estoque),
    }

    // Only include categoriaid if it's defined
    if (categoriaid) {
      dados.categoriaid = Number.parseInt(categoriaid)
    }

    // Incluir a imagem base64 se estiver presente
    if (imagem !== undefined) {
      dados.imagem = imagem
    }

    const atualizado = await produto.atualizarProduto(id, dados)
    res.status(200).json(atualizado)
  } catch (error) {
    console.error("Erro ao atualizar produto:", error)
    res.status(500).json({ message: error.message })
  }
})

// Corrigido o problema na rota de deletar
router.post("/deletar/:id", verificarAutenticacao, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id) // Extrair apenas o ID como número
    await produto.deletarProduto(id)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
