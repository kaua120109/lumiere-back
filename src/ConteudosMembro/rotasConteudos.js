// lumiere-back/src/ConteudosMembro/rotasConteudos.js

import { Router } from 'express';
import { ConteudoService } from './conteudos.js'; // Ajuste o caminho conforme sua estrutura
// IMPORTANTE: verifique se `verificarMembroAtivo` foi atualizado para ler de `req.usuario`
import { verificarAutenticacao, verificarAdmin, verificarMembroAtivo } from '../middleware/auth.js'; // Ajuste o caminho

const router = Router();

// Função utilitária para tratamento de erros
const handleRouteError = (res, error, defaultMessage, statusCode = 500) => {
  console.error(`Erro na rota:`, error.message || error);
  res.status(statusCode).json({
    message: error.message || defaultMessage,
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};

// --- ROTAS DE ADMINISTRAÇÃO ---
// Estas rotas exigem autenticação E privilégios de administrador
router.post('/admin', verificarAutenticacao, verificarAdmin, async (req, res) => {
  try {
    const novoConteudo = await ConteudoService.criarConteudo(req.body);
    res.status(201).json({
      message: 'Conteúdo criado com sucesso!',
      conteudo: novoConteudo
    });
  } catch (error) {
    handleRouteError(res, error, "Falha ao criar conteúdo.", 400);
  }
});

router.get('/admin', verificarAutenticacao, verificarAdmin, async (req, res) => {
  try {
    const apenasAtivos = req.query.ativo ? req.query.ativo === 'true' : undefined;
    const tipo = req.query.tipo;
    const conteudos = await ConteudoService.listarConteudos(tipo, apenasAtivos);
    res.status(200).json({ conteudos });
  } catch (error) {
    handleRouteError(res, error, "Falha ao listar conteúdos.", 400);
  }
});

router.get('/admin/:conteudoid', verificarAutenticacao, verificarAdmin, async (req, res) => {
  try {
    const { conteudoid } = req.params;
    const conteudo = await ConteudoService.buscarConteudoPorId(parseInt(conteudoid, 10));
    res.status(200).json(conteudo);
  } catch (error) {
    handleRouteError(res, error, "Conteúdo não encontrado.", 404);
  }
});

router.put('/admin/:conteudoid', verificarAutenticacao, verificarAdmin, async (req, res) => {
  try {
    const { conteudoid } = req.params;
    const conteudoAtualizado = await ConteudoService.atualizarConteudo(parseInt(conteudoid, 10), req.body);
    res.status(200).json({
      message: 'Conteúdo atualizado com sucesso!',
      conteudo: conteudoAtualizado
    });
  } catch (error) {
    handleRouteError(res, error, "Falha ao atualizar conteúdo.", 400);
  }
});

router.delete('/admin/:conteudoid', verificarAutenticacao, verificarAdmin, async (req, res) => {
  try {
    const { conteudoid } = req.params;
    await ConteudoService.deletarConteudo(parseInt(conteudoid, 10));
    res.status(200).json({ message: 'Conteúdo deletado com sucesso!' });
  } catch (error) {
    handleRouteError(res, error, "Falha ao deletar conteúdo.", 400);
  }
});


// --- ROTAS DE MEMBROS E USUÁRIOS GERAIS ---

// Rota para listar conteúdos disponíveis para todos (ativos)
router.get('/', async (req, res) => {
  try {
    const tipo = req.query.tipo;
    const conteudos = await ConteudoService.listarConteudos(tipo, true); // Sempre lista apenas ativos para usuários comuns
    res.status(200).json(conteudos);
  } catch (error) {
    handleRouteError(res, error, "Falha ao listar conteúdos.", 400);
  }
});

// Rotas que exigem ser membro ativo
// Acesso a conteúdos que são especificamente para membros
router.get('/membros', verificarAutenticacao, verificarMembroAtivo, async (req, res) => {
  try {
    // Aqui você pode adicionar lógica para filtrar conteúdos que são "exclusivos" para membros
    // Por enquanto, lista todos os conteúdos ativos, mas pode ser expandido com um campo 'isMemberExclusive' no modelo Conteudo
    const tipo = req.query.tipo;
    const conteudos = await ConteudoService.listarConteudos(tipo, true);
    res.status(200).json({ conteudos });
  } catch (error) {
    handleRouteError(res, error, "Falha ao listar conteúdos para membros.", 400);
  }
});

// Rota para obter detalhes de um conteúdo específico (apenas se for ativo)
router.get('/:conteudoid', async (req, res) => {
  try {
    const { conteudoid } = req.params;
    const conteudo = await ConteudoService.buscarConteudoPorId(parseInt(conteudoid, 10));
    if (!conteudo.ativo) {
      return handleRouteError(res, new Error('Acesso negado. Conteúdo não disponível.'), 403);
    }
    res.status(200).json(conteudo);
  } catch (error) {
    handleRouteError(res, error, "Conteúdo não encontrado ou acesso negado.", 404);
  }
});

// Rota para registrar visualização/progresso de conteúdo
router.post('/membros/conteudos/:conteudoid/progresso', verificarAutenticacao, verificarMembroAtivo, async (req, res) => {
  try {
    const usuarioid = req.usuario?.usuarioid;
    const { conteudoid } = req.params;
    const { progresso, visualizado } = req.body;

    if (!usuarioid) {
      return handleRouteError(res, new Error('Usuário não autenticado.'), 'Token de autenticação inválido.', 401);
    }
    if (progresso === undefined || isNaN(Number(progresso)) || Number(progresso) < 0 || Number(progresso) > 100) {
      return handleRouteError(res, new Error('Progresso inválido. Deve ser um número entre 0 e 100.'), 400);
    }
    const interacao = await ConteudoService.atualizarProgresso(usuarioid, conteudoid, progresso);
    res.status(200).json({
      message: 'Progresso atualizado com sucesso!',
      interacao: interacao
    });
  } catch (error) {
    handleRouteError(res, error, 'Não foi possível atualizar o progresso.', 400);
  }
});

// Rota para alternar status de favorito
router.post('/membros/conteudos/:conteudoid/favoritar', verificarAutenticacao, verificarMembroAtivo, async (req, res) => {
  try {
    const usuarioid = req.usuario?.usuarioid;
    const { conteudoid } = req.params;
    // O status 'favoritar' pode vir do corpo da requisição ou ser alternado
    const { favoritar } = req.body; // Adicione esta linha para ler o corpo da requisição
    if (!usuarioid) {
      return handleRouteError(res, new Error('Usuário não autenticado.'), 'Token de autenticação inválido.', 401);
    }
    const interacao = await ConteudoService.toggleFavorito(usuarioid, conteudoid, favoritar);
    res.status(200).json({
      message: 'Status de favorito atualizado com sucesso!',
      interacao: interacao
    });
  } catch (error) {
    handleRouteError(res, error, 'Não foi possível atualizar o status de favorito.', 400);
  }
});

// Rota para listar conteúdos favoritados por um usuário
router.get('/membros/favoritos', verificarAutenticacao, verificarMembroAtivo, async (req, res) => {
  try {
    const usuarioid = req.usuario?.usuarioid;
    if (!usuarioid) {
      return handleRouteError(res, new Error('Usuário não autenticado.'), 'Token de autenticação inválido.', 401);
    }
    const favoritos = await ConteudoService.listarConteudosFavoritados(usuarioid);
    res.status(200).json(favoritos);
  } catch (error) {
    handleRouteError(res, error, 'Não foi possível listar conteúdos favoritados.', 400);
  }
});

// Rota para listar conteúdos visualizados por um usuário
router.get('/membros/visualizados', verificarAutenticacao, verificarMembroAtivo, async (req, res) => {
  try {
    const usuarioid = req.usuario?.usuarioid;
    if (!usuarioid) {
      return handleRouteError(res, new Error('Usuário não autenticado.'), 'Token de autenticação inválido.', 401);
    }
    const visualizados = await ConteudoService.listarConteudosVisualizados(usuarioid);
    res.status(200).json(visualizados);
  } catch (error) {
    handleRouteError(res, error, 'Não foi possível listar conteúdos visualizados.', 400);
  }
});

// Rota para buscar interação específica do usuário com um conteúdo
router.get('/membros/interacao/:conteudoid', verificarAutenticacao, async (req, res) => {
  try {
    const usuarioid = req.usuario?.usuarioid;
    const { conteudoid } = req.params;
    if (!usuarioid) {
      return handleRouteError(res, new Error('Usuário não autenticado.'), 'Token de autenticação inválido.', 401);
    }
    const interacao = await ConteudoService.buscarInteracaoPorUsuarioEConteudo(usuarioid, parseInt(conteudoid, 10));
    if (!interacao) {
      return res.status(200).json({ message: 'Nenhuma interação encontrada para este conteúdo.', interacao: null });
    }
    res.status(200).json(interacao);
  } catch (error) {
    handleRouteError(res, error, 'Não foi possível buscar a interação do usuário com o conteúdo.', 400);
  }
});

export default router;