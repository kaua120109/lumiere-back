import { Router } from "express";
import { categoria } from "./repoCategorias.js";

const router = Router();

router.post("/lista-categorias", async (req, res) => {
  try {
    const resultado = await categoria.listaCategorias();
    res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro ao listar categorias:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/adicionar", async (req, res) => {
  console.log("Dados recebidos para criação:", req.body);
  try {
    const novaCategoria = await categoria.criarCategoria(req.body);
    res.status(201).json(novaCategoria);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;