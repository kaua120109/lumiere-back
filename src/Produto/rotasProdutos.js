import { Router } from "express";
import { produto } from "./repoProdutos.js";

const router = Router();

router.post("/lista-produtos", async (req, res) => {
  try {
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
    console.log(" Dados recebidos para criação:", req.body);
    const novoProduto = await produto.criarProduto(req.body);
    console.log("Produto criado:", novoProduto);
    res.status(201).json(novoProduto);
  } catch (error) {
    console.error("Erro ao adicionar produto:", error); 
    res.status(500).json({ error: error.message });
  }
});


router.post("/atualizar", async (req, res) => {
  try {
    const { produtoid, ...dadosAtualizados } = req.body;
    const produtoAtualizado = await produto.atualizarProduto(produtoid, dadosAtualizados);
    res.status(200).json(produtoAtualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/deletar", async (req, res) => {
  try {
    const { produtoid } = req.body;
    await produto.deletarProduto(produtoid);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export default router;