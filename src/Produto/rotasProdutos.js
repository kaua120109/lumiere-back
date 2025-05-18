import { Router } from "express";
import { produto } from "./repoProdutos.js";
import { verificarAutenticacao } from "../middleware/auth.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Garantir que o diretório de uploads existe
const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Diretório de uploads criado em: ${uploadDir}`);
}

// Configuração do armazenamento de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

// Configuração do multer com melhor tratamento de erros
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
  fileFilter: (req, file, cb) => {
    // Verificar tipos de arquivo permitidos
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas!'), false);
    }
  }
});

// Middleware personalizado para lidar com erros do multer
function handleMulterError(req, res, next) {
  upload.single('imagem')(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // Erro do multer
      console.error("Erro Multer:", err);
      return res.status(400).json({ 
        message: `Erro no upload: ${err.message}`,
        field: err.field,
        code: err.code
      });
    } else if (err) {
      // Outro erro
      console.error("Erro no upload:", err);
      return res.status(400).json({ message: `Erro no upload: ${err.message}` });
    }
    // Sem erro, continua
    next();
  });
}

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

router.post("/adicionar", verificarAutenticacao, handleMulterError, async (req, res) => {
  try {
    console.log("Dados recebidos:", req.body);
    console.log("Arquivo recebido:", req.file);
    
    const dados = req.body;
    // Corrigir o caminho da imagem para incluir o diretório
    const imagem = req.file ? `/uploads/${req.file.filename}` : null;
    
    console.log("Caminho da imagem:", imagem);

    const novoProduto = await produto.criarProduto(dados, imagem);
    res.status(201).json(novoProduto);
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/atualizar/:id", verificarAutenticacao, handleMulterError, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome, descricao, preco, estoque, categoriaid } = req.body;
    // Corrigir o caminho da imagem para ser consistente
    const imagem = req.file ? `/uploads/${req.file.filename}` : undefined;

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