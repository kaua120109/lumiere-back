import { Router } from 'express';
import { eventos } from './eventos.js'; // Importa suas funções de eventos

const router = Router();

// --- Rotas para Gerenciamento de Eventos ---

/**
 * Rota para listar todos os eventos.
 * GET /api/eventos
 */
router.get('/', async (req, res) => {
  try {
    const listaDeEventos = await eventos.listarEventos();
    res.status(200).json(listaDeEventos);
  } catch (error) {
    console.error("Erro na rota GET /api/eventos:", error);
    res.status(500).json({ message: error.message || "Erro interno do servidor ao listar eventos." });
  }
});

/**
 * Rota para buscar um evento por ID.
 * GET /api/eventos/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const eventId = BigInt(req.params.id); // Converte o ID para BigInt, como esperado pelo Prisma
    const eventoEncontrado = await eventos.buscarEventoPorId(eventId);

    if (!eventoEncontrado) {
      return res.status(404).json({ message: "Evento não encontrado." });
    }

    res.status(200).json(eventoEncontrado);
  } catch (error) {
    console.error(`Erro na rota GET /api/eventos/${req.params.id}:`, error);
    // Erros de conversão de BigInt ou outros erros internos
    res.status(500).json({ message: error.message || "Erro interno do servidor ao buscar evento." });
  }
});

/**
 * Rota para criar um novo evento.
 * POST /api/eventos
 */
router.post('/', async (req, res) => {
  try {
    const novoEvento = await eventos.criarEvento(req.body);
    res.status(201).json(novoEvento); // 201 Created
  } catch (error) {
    console.error("Erro na rota POST /api/eventos:", error);
    // Captura erros de validação ou outros problemas na criação
    res.status(400).json({ message: error.message || "Erro ao criar evento. Verifique os dados fornecidos." });
  }
});

/**
 * Rota para atualizar um evento existente.
 * PUT /api/eventos/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const eventId = BigInt(req.params.id); // Converte o ID para BigInt
    const eventoAtualizado = await eventos.atualizarEvento(eventId, req.body);

    if (!eventoAtualizado) {
      return res.status(404).json({ message: "Evento não encontrado para atualização." });
    }

    res.status(200).json(eventoAtualizado);
  } catch (error) {
    console.error(`Erro na rota PUT /api/eventos/${req.params.id}:`, error);
    res.status(400).json({ message: error.message || "Erro ao atualizar evento. Verifique o ID e os dados." });
  }
});

/**
 * Rota para deletar um evento.
 * DELETE /api/eventos/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const eventId = BigInt(req.params.id); // Converte o ID para BigInt
    const eventoDeletado = await eventos.deletarEvento(eventId);

    if (!eventoDeletado) {
      // Embora `prisma.delete` lance um erro se não encontrar, é bom ter uma checagem.
      // Se a operação for bem-sucedida, `eventoDeletado` conterá o objeto deletado.
      return res.status(404).json({ message: "Evento não encontrado para exclusão." });
    }

    res.status(200).json({ message: "Evento deletado com sucesso!", evento: eventoDeletado });
  } catch (error) {
    console.error(`Erro na rota DELETE /api/eventos/${req.params.id}:`, error);
    res.status(500).json({ message: error.message || "Erro ao deletar evento." });
  }
});

export default router;