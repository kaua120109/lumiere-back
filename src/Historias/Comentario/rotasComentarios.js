import express from "express";
import { comentarios } from "./comentarios.js";
import { verifyToken } from "../jwt.js";

const router = express.Router();

// GET - Listar comentários de uma história
router.get('/historia/:historiaId', async (req, res) => {
  try {
    const { historiaId } = req.params;
    const lista = await comentarios.listarComentarios(historiaId);
    res.json(lista);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar um novo comentário
router.post('/', verifyToken, async (req, res) => {
  try {
    const dados = req.body;
    const novo = await comentarios.criarComentario(dados);
    res.status(201).json(novo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Excluir um comentário
router.delete('/:comentarioId', verifyToken, async (req, res) => {
  try {
    const { comentarioId } = req.params;
    await comentarios.excluirComentario(comentarioId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Listar comentários de um usuário
router.get('/usuario/:usuarioId', verifyToken, async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const lista = await comentarios.listarComentariosPorUsuario(usuarioId);
    res.json(lista);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;