import { Router } from "express"
import { categoria } from "./repoCategorias.js"

const router = Router()

// Rota para listar categorias
router.get("/lista-categorias", async (req, res) => {
  try {
    const resultado = await categoria.listaCategorias()
    res.status(200).json(resultado)
  } catch (error) {
    console.error("Erro ao listar categorias:", error)
    res.status(500).json({ message: error.message })
  }
})

// Rota para adicionar categoria - agora aceitando base64
router.post("/adicionar", async (req, res) => {
  try {
    const { nome, imagem } = req.body

    // Agora a imagem já vem como base64 do frontend
    const novaCategoria = await categoria.criarCategoria({
      nome,
      imagem: imagem || null,
    })

    res.status(201).json(novaCategoria)
  } catch (error) {
    console.error("Erro ao adicionar categoria:", error)
    res.status(500).json({ error: error.message })
  }
})

// Rota para atualizar categoria - agora aceitando base64
router.put("/atualizar/:id", async (req, res) => {
  try {
    const id = req.params.id
    const { nome, imagem } = req.body

    // Agora a imagem já vem como base64 do frontend
    const resultado = await categoria.atualizarCategoria(id, {
      nome,
      imagem: imagem,
    })

    res.status(200).json(resultado)
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error)
    res.status(500).json({ message: error.message })
  }
})

// Rota para deletar categoria
router.delete("/deletar/:id", async (req, res) => {
  try {
    const id = req.params.id

    if (!id) {
      return res.status(400).json({ message: "ID não fornecido na URL" })
    }

    await categoria.deletarCategoria(BigInt(id))
    res.status(200).json({ message: "Categoria deletada com sucesso" })
  } catch (erro) {
    console.error("Erro ao deletar categoria:", erro)
    res.status(500).json({ message: erro.message })
  }
})

export default router
