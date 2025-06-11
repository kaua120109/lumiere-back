// backend/src/Eventos/rotasEventos.js
import express from 'express';
import { eventos } from './eventos.js'; // Verifique o caminho correto para o seu arquivo eventos.js

const router = express.Router();

// Middleware para tratamento de erros centralizado nas rotas deste módulo
const errorHandler = (err, req, res, next) => {
  console.error('❌ Erro na rota:', req.originalUrl, err); // Loga o erro completo no console do servidor

  // Define o status code com base no tipo de erro
  let statusCode = 500; // Erro interno do servidor por padrão
  let message = 'Ocorreu um erro interno no servidor.';

  if (err.message.includes('inválida') || err.message.includes('deve ser um número') || err.message.includes('O valor fornecido é muito longo') || err.message.includes('Já existe um evento com o(s) dado(s)')) {
    statusCode = 400; // Bad Request - Erros de validação de dados fornecidos pelo cliente
    message = err.message;
  } else if (err.message.includes('não encontrado')) {
    statusCode = 404; // Not Found - Recurso não encontrado
    message = err.message;
  }

  // Responde ao cliente com o status code e a mensagem de erro
  res.status(statusCode).json({ message });
};


// Rota para listar todos os eventos
router.get('/', async (req, res, next) => {
  try {
    const todosEventos = await eventos.listarEventos();
    res.json(todosEventos);
  } catch (error) {
    next(error); // Passa o erro para o middleware de tratamento de erros
  }
});

// Rota para buscar evento por ID
router.get('/:id', async (req, res, next) => {
  try {
    const evento = await eventos.buscarEventoPorId(req.params.id);
    if (evento) {
      res.json(evento);
    } else {
      res.status(404).json({ message: 'Evento não encontrado.' });
    }
  } catch (error) {
    next(error);
  }
});

// Rota para criar um novo evento
router.post('/', async (req, res, next) => {
  try {
    const novoEvento = await eventos.criarEvento(req.body);
    res.status(201).json(novoEvento); // 201 Created
  } catch (error) {
    next(error);
  }
});

// Rota para atualizar um evento existente
router.put('/:id', async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const dadosAtualizacao = req.body;
    const eventoAtualizado = await eventos.atualizarEvento(eventId, dadosAtualizacao);
    res.json(eventoAtualizado);
  } catch (error) {
    next(error); // Passa o erro para o middleware de tratamento de erros
  }
});

// Rota para deletar um evento
router.delete('/:id', async (req, res, next) => {
  try {
    const eventoDeletado = await eventos.deletarEvento(req.params.id);
    res.json({ message: 'Evento deletado com sucesso!', evento: eventoDeletado });
  } catch (error) {
    next(error);
  }
});

// Aplica o middleware de tratamento de erros no final das rotas
router.use(errorHandler);

export default router;