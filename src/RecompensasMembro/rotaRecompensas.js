// lumiere-back/src/RecompensasMembro/rotaRecompensas.js
import express from 'express';
// Ajuste o caminho de importação conforme a localização do seu 'recompensas.js'
// Se 'recompensas.js' estiver em 'src/router/controllers/', e 'rotaRecompensas.js' em 'src/RecompensasMembro/',
// o caminho pode precisar ser ajustado. Assumi o caminho mais provável dado o exemplo:
import { getRecompensasUsuario, getProgressoUsuario, redeemReward } from './recompensas.js';
import { verificarAutenticacao } from '../middleware/auth.js'; // Assumindo um middleware de autenticação

const router = express.Router();

// Rota para obter o progresso de pontos e nível do usuário logado
// MONTADO EM /programa/progresso pelo index.js
router.get('/progresso', verificarAutenticacao, getProgressoUsuario);

// Rota para obter as recompensas disponíveis para o usuário logado
// MONTADO EM /recompensas pelo index.js
router.get('/', verificarAutenticacao, getRecompensasUsuario);

// Rota para resgatar uma recompensa específica
// MONTADO EM /recompensas/resgatar/:recompensaid pelo index.js
router.post('/resgatar/:recompensaid', verificarAutenticacao, redeemReward);

export default router;