import { Router } from "express";
import { produto } from "./repoProdutos.js";
import { verificarAutenticacao } from "../middleware/auth.js";
import multer from 'multer';
import path from 'path';

const router = Router();

// Configuração do armazenamento de imagens (sem alterações)
const storage = multer.diskStorage({
  destination: 'uploads/', 
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });

// Rota para listar produtos - agora com pesquisa
router.get("/pesquisar", verificarAutenticacao, async (req, res) => {
  const query = req.query.q || ""; // Captura o parâmetro de busca 'q', se não houver, busca todos os produtos.

  try {
    const produtos = await produto.listarProdutos(query); // Passa a query para o repositório
    res.status(200).json(produtos);
  } catch (error) {
    console.error("Erro ao pesquisar produtos:", error);
    res.status(500).json({ message: error.message });
  }
});

// Rota para listar produtos - agora com autenticação
router.get("/lista-produtos", verificarAutenticacao, async (req, res) => {
  try {
    const response = await produto.listarProdutos();
    res.status(200).json(response);
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/adicionar", upload.single('imagem'), verificarAutenticacao, async (req, res) => {
  try {
    const dados = req.body;
    const imagem = req.file ? req.file.filename : null;

    const novoProduto = await produto.criarProduto(dados, imagem);
    res.status(201).json(novoProduto);
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/atualizar/:id", upload.single("imagem"), verificarAutenticacao, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome, descricao, preco, estoque, categoriaid } = req.body;
    const imagem = req.file ? `/uploads/produtos/${req.file.filename}` : undefined;

    // Make sure categoriaid is not undefined before passing it
    const dados = {
      nome,
      descricao,
      preco: parseFloat(preco),
      estoque: parseInt(estoque),
    };

    // Only include categoriaid if it's defined
    if (categoriaid) {
      dados.categoriaid = parseInt(categoriaid);
    }

    if (imagem) {
      dados.imagem = imagem;
    }

    const atualizado = await produto.atualizarProduto(id, dados);
    res.status(200).json(atualizado);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    res.status(500).json({ message: error.message });
  }
});

// Corrigido o problema na rota de deletar
router.post("/deletar/:id", verificarAutenticacao, async (req, res) => {
  try {
    const id = parseInt(req.params.id); // Extrair apenas o ID como número
    await produto.deletarProduto(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;