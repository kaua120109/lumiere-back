// src/router/routes/rotasPagamentos.js
import express from 'express';
import cors from 'cors';
import { pagamento } from '../repo/repoPagamentos.js'; // Ajuste o caminho conforme sua estrutura
import { Router } from 'express';
import { adicionarPontos } from '../services/pontosService.js'; // Importa o serviço de pontos

const router = Router();
// const PORT = process.env.PORT || 3000; // Esta linha pode não ser necessária em um arquivo de rota

// Middleware
router.use(cors()); //
router.use(express.json()); //

// Rotas de pagamento
router.get('/api/pagamentos', async (req, res) => {
  try {
    const pagamentos = await pagamento.listarPagamentos(); //
    res.json(pagamentos); //
  } catch (error) {
    res.status(500).json({ error: error.message }); //
  }
});

router.post('/api/pagamentos', async (req, res) => {
  try {
    // Formatar os dados recebidos do frontend para o formato esperado pelo Prisma
    const dadosPagamento = {
      valor: parseFloat(req.body.valor), // Use `parseFloat` para garantir que é um número
      status: req.body.status || 1, // 1 = Aprovado (você pode definir seus próprios status)
      data: new Date(), //
      usuarioid: req.body.usuarioid, // O ID do usuário deve vir do frontend (ou do token)
      transacao: req.body.transactionId, //
      ordemId: req.body.orderId, // Certifique-se de que o orderId está sendo enviado do frontend
      formaPagamento: req.body.formaPagamento, //
      cartao: req.body.cartao || null, //
      parcelas: req.body.parcelas || 1 //
    };

    const novoPagamento = await pagamento.criarPagamento(dadosPagamento); //

    // --- ADIÇÃO DE PONTOS PELA COMPRA ---
    // Exemplo: 1 ponto a cada 10 unidades monetárias gastas na compra
    const pontosGanhos = Math.floor(dadosPagamento.valor / 10);
    if (pontosGanhos > 0) {
      if (dadosPagamento.usuarioid) { // Garante que o ID do usuário existe
        await adicionarPontos(dadosPagamento.usuarioid, pontosGanhos);
        console.log(`[Backend] Pontos adicionados ao usuário ${dadosPagamento.usuarioid} pela compra.`);
      }
    }
    // --- FIM DA ADIÇÃO DE PONTOS ---

    res.status(201).json(novoPagamento); //
  } catch (error) {
    console.error('Erro ao processar pagamento:', error); //
    res.status(500).json({ error: error.message }); //
  }
});

router.put('/api/pagamentos/:id', async (req, res) => {
  try {
    const id = BigInt(req.params.id); //
    const pagamentoAtualizado = await pagamento.atualizarPagamento(id, req.body); //
    res.json(pagamentoAtualizado); //
  } catch (error) {
    res.status(500).json({ error: error.message }); //
  }
});

router.delete('/api/pagamentos/:id', async (req, res) => {
  try {
    const id = BigInt(req.params.id); //
    await pagamento.deletarPagamento(id); //
    res.status(204).send(); //
  } catch (error) {
    res.status(500).json({ error: error.message }); //
  }
});

export default router;