import { Router } from "express";
import { categoria } from "./repoCategorias.js";
import multer from 'multer';
import path from 'path'; // não se esqueça disso

const router = Router();

const storage = multer.diskStorage({
  destination: 'uploads/', // Pasta onde os arquivos serão salvos
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Exemplo: 1683891231234.jpg
  }
});

const upload = multer({ storage }); // <-- você usou esse nome corretamente aqui

router.post("/lista-categorias", async (req, res) => {
  try {
    const resultado = await categoria.listaCategorias();
    res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro ao listar categorias:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/adicionar", upload.single("icone"), async (req, res) => {
  try {
    const { nome } = req.body;
    const icone = req.file ? `/uploads/categorias/${req.file.filename}` : "";

    const novaCategoria = await categoria.criarCategoria({ nome, imagem: icone });
    res.status(201).json(novaCategoria);
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    res.status(500).json({ message: error.message });
  }
});

router.put("/atualizar/:id", upload.single("icone"), async (req, res) => {
  try {
    const id = req.params.id;
    const { nome } = req.body;
    const icone = req.file ? `/uploads/categorias/${req.file.filename}` : "";

    const resultado = await categoria.atualizarCategoria(id, { nome, imagem: icone });
    res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    res.status(500).json({ message: error.message });
  }
});

router.delete('/deletar/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ message: 'ID não fornecido na URL' });
    }

    await categoria.deletarCategoria(BigInt(id)); 
    res.status(200).json({ message: 'Categoria deletada com sucesso' });
  } catch (erro) {
    console.error("Erro ao deletar categoria:", erro);
    res.status(500).json({ message: erro.message });
  }
});


export default router;