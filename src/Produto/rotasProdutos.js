import { Router } from "express";
import { produto } from "./repoProdutos.js";
import multer from 'multer';
import path from 'path';

const router = Router();

// Configuração do armazenamento de imagens
const storage = multer.diskStorage({
  destination: 'uploads/', // Pasta onde os arquivos serão salvos
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Exemplo: 1683891231234.jpg
  }
});

const upload = multer({ storage });

router.post("/lista-produtos", async (req, res) => {
  try {
    const response = await produto.listarProdutos();
    res.status(200).json(response);
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/adicionar", upload.single('imagem'), async (req, res) => {
  try {

    const dados = req.body;
    const imagem = req.file ? req.file.filename : null;

    const novoProduto = await produto.criarProduto(dados,imagem);
    res.status(201).json(novoProduto);
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/atualizar/:id", upload.single("imagem"), async (req, res) => {
  try {
    const id = parseInt(req.params.id); 
    const { nome, descricao, preco, estoque, categoriaid } = req.body;
    const imagem = req.file ? `/uploads/produtos/${req.file.filename}` : undefined;

    const dados = {
      nome,
      descricao,
      preco: parseFloat(preco),
      estoque: parseInt(estoque),
      categoriaid: parseInt(categoriaid),
    };

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



router.post("/deletar/:id", async (req, res) => {
  try {
    const  produtoid  = req.params;
    await produto.deletarProduto(produtoid);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
