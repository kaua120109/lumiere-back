import express from 'express';
import { cadastrarMembro, loginMembro, cadastrarInscricaoMembro } from './membro.js';
import { verificarAutenticacao, verificarMembroAtivo } from '../middleware/auth.js';

const router = express.Router();

// Rotas públicas (não requerem autenticação)
router.post('/cadastro', cadastrarMembro);
router.post('/login', loginMembro);
router.post('/inscricao', cadastrarInscricaoMembro);

// Rotas protegidas (requerem autenticação e status de membro ativo)
router.get('/perfil', verificarAutenticacao, verificarMembroAtivo, (req, res) => {
  // O middleware verificarMembroAtivo já adiciona as informações do membro ao req.membro
  res.status(200).json({
    message: 'Perfil do membro',
    usuario: req.usuario,
    membro: req.membro
  });
});

export default router;