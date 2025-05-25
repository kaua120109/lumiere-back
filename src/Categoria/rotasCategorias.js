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

    // Validação básica
    if (!nome || nome.trim() === "") {
      return res.status(400).json({ message: "Nome da categoria é obrigatório" })
    }

    // Agora a imagem já vem como base64 do frontend
    const novaCategoria = await categoria.criarCategoria({
      nome: nome.trim(),
      imagem: imagem || null,
    })

    res.status(201).json(novaCategoria)
  } catch (error) {
    console.error("Erro ao adicionar categoria:", error)
    res.status(500).json({ message: error.message })
  }
})

// Rota para atualizar categoria - corrigida para usar PUT
router.put("/atualizar/:id", async (req, res) => {
  try {
    const id = req.params.id
    const { nome, imagem } = req.body

    // Validações
    if (!id) {
      return res.status(400).json({ message: "ID da categoria não fornecido" })
    }

    if (!nome || nome.trim() === "") {
      return res.status(400).json({ message: "Nome da categoria é obrigatório" })
    }

    // Agora a imagem já vem como base64 do frontend
    const resultado = await categoria.atualizarCategoria(id, {
      nome: nome.trim(),
      imagem: imagem,
    })

    if (!resultado) {
      return res.status(404).json({ message: "Categoria não encontrada" })
    }

    res.status(200).json(resultado)
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error)
    res.status(500).json({ message: error.message })
  }
})

// Rota para deletar categoria - mantida como DELETE e com melhor tratamento de erros
router.delete("/deletar/:id", async (req, res) => {
  try {
    const id = req.params.id

    // Validações melhoradas
    if (!id) {
      return res.status(400).json({ message: "ID da categoria não fornecido na URL" })
    }

    // Verificar se o ID é um número válido
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ message: "ID da categoria deve ser um número válido" })
    }

    // Tentar deletar a categoria
    const resultado = await categoria.deletarCategoria(BigInt(id))
    
    // Se o método deletarCategoria retorna algo para indicar sucesso/falha
    if (resultado === false || resultado === null) {
      return res.status(404).json({ message: "Categoria não encontrada" })
    }

    res.status(200).json({ 
      message: "Categoria deletada com sucesso",
      categoriaid: id 
    })
    
  } catch (erro) {
    console.error("Erro ao deletar categoria:", erro)
    
    // Tratamento específico para diferentes tipos de erro
    if (erro.message.includes("não encontrada") || erro.message.includes("not found")) {
      return res.status(404).json({ message: "Categoria não encontrada" })
    }
    
    if (erro.message.includes("constraint") || erro.message.includes("foreign key")) {
      return res.status(409).json({ 
        message: "Não é possível excluir esta categoria pois ela está sendo utilizada em produtos" 
      })
    }
    
    res.status(500).json({ message: erro.message || "Erro interno do servidor" })
  }
})

// Rota adicional POST para compatibilidade (caso alguns lugares ainda usem POST)
router.post("/deletar/:id", async (req, res) => {
  try {
    const id = req.params.id

    if (!id) {
      return res.status(400).json({ message: "ID da categoria não fornecido na URL" })
    }

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ message: "ID da categoria deve ser um número válido" })
    }

    const resultado = await categoria.deletarCategoria(BigInt(id))
    
    if (resultado === false || resultado === null) {
      return res.status(404).json({ message: "Categoria não encontrada" })
    }

    res.status(200).json({ 
      message: "Categoria deletada com sucesso",
      categoriaid: id 
    })
    
  } catch (erro) {
    console.error("Erro ao deletar categoria:", erro)
    
    if (erro.message.includes("não encontrada") || erro.message.includes("not found")) {
      return res.status(404).json({ message: "Categoria não encontrada" })
    }
    
    if (erro.message.includes("constraint") || erro.message.includes("foreign key")) {
      return res.status(409).json({ 
        message: "Não é possível excluir esta categoria pois ela está sendo utilizada em produtos" 
      })
    }
    
    res.status(500).json({ message: erro.message || "Erro interno do servidor" })
  }
})

export default router