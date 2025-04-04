import { Router } from "express";
import { produto } from "./repoProdutos.js";

const router = Router();

router.post("/lista-produtos", async (req, res) => {
  try {
    console.log('OI KAUA')
    const response = await produto.listarProdutos();
    req.body = response;
    res.status(200).json(response);
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/adicionar", async (req, res) => {
  try {
    const novoProduto = await produto.criarProduto(req.body);
    res.status(201).json(novoProduto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;