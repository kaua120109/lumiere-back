import express from 'express';
import cors from 'cors';
import { pagamento } from './repoPagamentos.js';
import { Router } from 'express';
// import { verificarAutenticacao } from '../middleware/auth.js';      

const router = Router();
const PORT = process.env.PORT || 3000;

// Middleware
router.use(cors());
router.use(express.json());

// Rotas de pagamento
router.get('/api/pagamentos', async (req, res) => {
  try {
    const pagamentos = await pagamento.listarPagamentos();
    res.json(pagamentos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/api/pagamentos', async (req, res) => {
  try {
    // Formatar os dados recebidos do frontend para o formato esperado pelo Prisma
    const dadosPagamento = {
      valor: req.body.total.toString(),
      status: 1, // 1 = Aprovado (você pode definir seus próprios status)
      data: new Date(),
      usuarioid: req.body.usuarioid || 1, // Valor padrão caso não seja fornecido
      transacao: req.body.transactionId,
      ordem: req.body.ordem || 1, // Valor padrão caso não seja fornecido
      formaPagamento: req.body.paymentMethod === 'credit' ? 'Cartão de Crédito' : 'Pix',
      cartao: req.body.paymentMethod === 'credit' ? 
        `${req.body.cardNumber.slice(-4)}` : null,
      parcelas: req.body.paymentMethod === 'credit' ? 
        req.body.installments.value : 1,
      ordemId: req.body.ordemId || 1 // Valor padrão caso não seja fornecido
    };

    const novoPagamento = await pagamento.criarPagamento(dadosPagamento);
    res.status(201).json(novoPagamento);
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/api/pagamentos/:id', async (req, res) => {
  try {
    const id = BigInt(req.params.id);
    const pagamentoAtualizado = await pagamento.atualizarPagamento(id, req.body);
    res.json(pagamentoAtualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/api/pagamentos/:id', async (req, res) => {
  try {
    const id = BigInt(req.params.id);
    await pagamento.deletarPagamento(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar o servidor
router.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});