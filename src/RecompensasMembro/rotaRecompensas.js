// src/router/routes/rotaRecompensas.js
import express from 'express';
import { getRecompensasUsuario, getProgressoUsuario, redeemReward } from './recompensas.js'; // Importa as funções do controller
import { verificarAutenticacao } from '../middleware/auth.js'; // Assumindo um middleware de autenticação

const router = express.Router();

// Rota para obter o progresso de pontos e nível do usuário logado
router.get('/api/programa/progresso', verificarAutenticacao, getProgressoUsuario);

// Rota para obter as recompensas disponíveis para o usuário logado
router.get('/api/recompensas', verificarAutenticacao, getRecompensasUsuario);

// Rota para resgatar uma recompensa específica
router.post('/api/recompensas/resgatar/:recompensaid', verificarAutenticacao, redeemReward);

export default router;