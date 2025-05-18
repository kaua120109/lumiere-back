import { Router } from "express";
import { categoria } from "./repoCategorias.js";
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
  limits: { fileSize: 2 * 1024 * 1024 }, // Limite de 2MB
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
  upload.single('icone')(req, res, function(err) {
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

// Rota para listar categorias
router.get("/lista-categorias", async (req, res) => {
  try {
    const resultado = await categoria.listaCategorias();
    res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro ao listar categorias:", error);
    res.status(500).json({ message: error.message });
  }
});

// Rota para adicionar categoria
router.post("/adicionar", handleMulterError, async (req, res) => {
  try {
    console.log("Dados recebidos:", req.body);
    console.log("Arquivo recebido:", req.file);
    
    const { nome } = req.body;
    // Corrigir o caminho do ícone para incluir o diretório
    const icone = req.file ? `/uploads/${req.file.filename}` : "";
    
    console.log("Caminho do ícone:", icone);

    // Ajustar para corresponder à assinatura do método no seu repositório
    const novaCategoria = await categoria.criarCategoria({ nome, imagem: icone });
    res.status(201).json(novaCategoria);
  } catch (error) {
    console.error("Erro ao adicionar categoria:", error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para atualizar categoria
router.put("/atualizar/:id", handleMulterError, async (req, res) => {
  try {
    const id = req.params.id;
    const { nome } = req.body;
    // Corrigir o caminho do ícone para ser consistente
    const icone = req.file ? `/uploads/${req.file.filename}` : undefined;

    console.log("Atualizando categoria:", { id, nome, icone });

    // Ajustar para corresponder à assinatura do método no seu repositório
    const resultado = await categoria.atualizarCategoria(id, { nome, imagem: icone });
    res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    res.status(500).json({ message: error.message });
  }
});

// Rota para deletar categoria
router.delete('/deletar/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ message: 'ID não fornecido na URL' });
    }

    console.log("Deletando categoria com ID:", id);
    
    // Usar o método conforme implementado no seu repositório
    await categoria.deletarCategoria(BigInt(id)); 
    res.status(200).json({ message: 'Categoria deletada com sucesso' });
  } catch (erro) {
    console.error("Erro ao deletar categoria:", erro);
    res.status(500).json({ message: erro.message });
  }
});

export default router;