import express from 'express';
import * as membroController from './membro.js';

const router = express.Router();

// Rota para cadastrar um novo membro
router.post('/cadastro-membro', membroController.cadastrarMembro);

// Rota para login de membro
router.post('/login-membro', membroController.loginMembro);

// Rota para inscrição de membro
router.post('/inscricao', membroController.cadastrarInscricaoMembro);

export default router;