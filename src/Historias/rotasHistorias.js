import express from "express";
import { historias, comentarios } from "./historias.js";
import { verifyTokenMiddleware as verifyToken } from "../jwt.js";


const router = express.Router();

// ===== ROTAS DE HISTÓRIAS =====

// GET - Listar todas as histórias
// Temporariamente remova o verifyToken para teste
router.get('/', async (req, res) => {
  try {
    console.log("Recebida requisição GET para /historias");
    const todas = await historias.listaHistorias();
    res.json(todas);
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar uma nova história
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log("Recebida requisição POST para /historias");
    const dados = req.body;
    const nova = await historias.criarHistoria(dados);
    res.status(201).json(nova);
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Buscar histórias por usuário
router.get('/usuario/:usuarioId', verifyToken, async (req, res) => {
  try {
    console.log("Recebida requisição GET para /historias/usuario/:usuarioId");
    const { usuarioId } = req.params;
    const historiasUsuario = await historias.listaHistoriasPorUsuario(parseInt(usuarioId));
    res.json(historiasUsuario);
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Buscar uma história específica
router.get('/:id', async (req, res) => {
  try {
    console.log("Recebida requisição GET para /historias/:id");
    const { id } = req.params;
    const historia = await historias.buscarHistoriaPorId(id);
    
    if (!historia) {
      return res.status(404).json({ error: 'História não encontrada' });
    }
    
    res.json(historia);
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Atualizar uma história
router.put('/:id', verifyToken, async (req, res) => {
  try {
    console.log("Recebida requisição PUT para /historias/:id");
    const { id } = req.params;
    const dados = req.body;
    const atualizada = await historias.atualizarHistoria(id, dados);
    res.json(atualizada);
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Remover uma história
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    console.log("Recebida requisição DELETE para /historias/:id");
    const { id } = req.params;
    await historias.deletarHistoria(id);
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ROTAS DE COMENTÁRIOS =====

// GET - Listar comentários de uma história
router.get('/:historiaId/comentarios', async (req, res) => {
  try {
    console.log("Recebida requisição GET para /historias/:historiaId/comentarios");
    const { historiaId } = req.params;
    const lista = await comentarios.listarComentarios(historiaId);
    res.json(lista);
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar um novo comentário
router.post('/:historiaId/comentarios', verifyToken, async (req, res) => {
  try {
    console.log("Recebida requisição POST para /historias/:historiaId/comentarios");
    const { historiaId } = req.params;
    const dados = {
      ...req.body,
      historiaId
    };
    const novo = await comentarios.criarComentario(dados);
    res.status(201).json(novo);
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Excluir um comentário
router.delete('/comentarios/:comentarioId', verifyToken, async (req, res) => {
  try {
    console.log("Recebida requisição DELETE para /historias/comentarios/:comentarioId");
    const { comentarioId } = req.params;
    await comentarios.excluirComentario(comentarioId);
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Listar comentários de um usuário
router.get('/comentarios/usuario/:usuarioId', verifyToken, async (req, res) => {
  try {
    console.log("Recebida requisição GET para /historias/comentarios/usuario/:usuarioId");
    const { usuarioId } = req.params;
    const lista = await comentarios.listarComentariosPorUsuario(usuarioId);
    res.json(lista);
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;