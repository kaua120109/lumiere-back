import { Router } from 'express';
import { eventos } from './eventos.js'; // Assegure-se de que o caminho está correto

const router = Router();

// Middleware de log melhorado
router.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const clientIP = req.ip || req.connection.remoteAddress;
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${clientIP}`);
  next();
});

// Middleware de tratamento de erros global
const handleError = (error, req, res) => {
  console.error(`❌ Erro na rota ${req.method} ${req.path}:`, error);

  if (error.message.includes('banco de dados') || error.name === 'PrismaClientKnownRequestError' && error.code === 'P1001') {
    return res.status(503).json({
      error: 'Serviço indisponível',
      message: 'Problemas de conexão com o banco de dados. Verifique se o banco está rodando e as variáveis de ambiente estão corretas.',
      code: 'DATABASE_CONNECTION_ERROR',
      details: error.message
    });
  }

  if (error.message.includes('não encontrada') || error.name === 'PrismaClientKnownRequestError' && error.code === 'P2021') {
    return res.status(500).json({
      error: 'Erro de configuração',
      message: 'Tabela de eventos não encontrada. Execute as migrations do Prisma.',
      code: 'TABLE_NOT_FOUND',
      details: error.message
    });
  }

  if (error.message.includes('ID inválido')) {
    return res.status(400).json({
      error: 'Parâmetro inválido',
      message: 'O ID fornecido não é um número válido ou está fora do formato esperado.',
      code: 'INVALID_ID_PARAMETER'
    });
  }

  // Erros de validação personalizados
  if (error.message.includes('Nome do evento é obrigatório') ||
      error.message.includes('Data do evento é obrigatória') ||
      error.message.includes('Local do evento é obrigatório') ||
      error.message.includes('A data do evento deve ser futura') ||
      error.message.includes('Distância em Km deve ser um número válido') ||
      error.message.includes('Distância em Km não pode ser negativa')) {
    return res.status(400).json({
      error: 'Dados inválidos',
      message: error.message,
      code: 'INVALID_EVENT_DATA'
    });
  }

  // Erros do Prisma relacionados a dados (ex: tipo de dado inválido)
  if (error.name === 'PrismaClientValidationError') {
    return res.status(400).json({
      error: 'Erro de validação de dados',
      message: 'Um ou mais campos contêm dados inválidos. Verifique os tipos de dados e os campos obrigatórios.',
      code: 'PRISMA_VALIDATION_ERROR',
      details: error.message
    });
  }

  if (error.name === 'PrismaClientKnownRequestError' && error.code === 'P2025') {
    // Este erro P2025 já é tratado na camada de serviço (eventos.js) para retornar null
    // Mas, se por algum motivo ele for lançado aqui, tratamos como 404
    return res.status(404).json({
      error: 'Evento não encontrado',
      message: `Nenhum evento encontrado com o ID especificado.`,
      code: 'EVENT_NOT_FOUND_DB'
    });
  }

  // Erro genérico
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: 'Ocorreu um erro inesperado ao processar a requisição.',
    code: 'INTERNAL_SERVER_ERROR',
    details: error.message // Inclui detalhes para depuração, mas pode ser removido em produção
  });
};

// Middleware para validar o ID do evento
const validateId = (req, res, next) => {
  const { id } = req.params;
  // Express validator pode ser usado aqui, ou uma checagem manual
  if (!id || isNaN(Number(id))) { // isNaN(Number(id)) verifica se é um número válido (incluindo string de números)
    return res.status(400).json({
      error: 'Parâmetro inválido',
      message: 'O ID do evento deve ser um número válido.',
      code: 'INVALID_ID_FORMAT'
    });
  }
  next();
};

// Middleware para validar dados do evento
const validateEventData = (req, res, next) => {
  let { nome, descricao, data, local, imagem, km, categoria } = req.body;

  // Campos obrigatórios
  if (!nome || typeof nome !== 'string' || nome.trim() === '') {
    return res.status(400).json({ message: 'Nome do evento é obrigatório.' });
  }
  req.body.nome = nome.trim(); // Limpa espaços em branco

  if (!data) {
    return res.status(400).json({ message: 'Data do evento é obrigatória.' });
  }
  const eventDate = new Date(data);
  if (isNaN(eventDate.getTime())) {
    return res.status(400).json({ message: 'Formato de data inválido.' });
  }
  // O frontend já envia em formato datetime-local, que Date() consegue parsear.
  // No entanto, é bom garantir que seja um objeto Date antes de passar para o Prisma
  req.body.data = eventDate;

  if (!local || typeof local !== 'string' || local.trim() === '') {
    return res.status(400).json({ message: 'Local do evento é obrigatório.' });
  }
  req.body.local = local.trim(); // Limpa espaços em branco

  // Tratamento e validação do campo 'descricao'
  if (descricao !== undefined && typeof descricao !== 'string') {
    return res.status(400).json({ message: 'A descrição deve ser uma string.' });
  }
  req.body.descricao = descricao ? descricao.trim() : null; // Define como null se for string vazia

  // Tratamento e validação do campo 'imagem'
  if (imagem !== undefined && typeof imagem !== 'string') {
    return res.status(400).json({ message: 'O campo imagem deve ser uma URL ou string.' });
  }
  req.body.imagem = imagem ? imagem.trim() : null; // Define como null se for string vazia

  // NOVO: Tratamento do campo 'km'
  if (km === '') {
    req.body.km = null; // Converte string vazia para null
  } else if (km !== undefined && km !== null) {
    const parsedKm = parseFloat(km);
    if (isNaN(parsedKm)) {
      return res.status(400).json({ message: 'Distância em Km deve ser um número válido.' });
    }
    if (parsedKm < 0) {
      return res.status(400).json({ message: 'Distância em Km não pode ser negativa.' });
    }
    req.body.km = parsedKm;
  }
  // Se km for undefined ou null, ele já estará no formato correto, então não fazemos nada.

  // Tratamento e validação do campo 'categoria'
  if (categoria !== undefined && typeof categoria !== 'string') {
    return res.status(400).json({ message: 'A categoria deve ser uma string.' });
  }
  req.body.categoria = categoria ? categoria.trim() : null; // Define como null se for string vazia

  next();
};

// Rotas de Eventos
// Criar evento
router.post('/', validateEventData, async (req, res) => {
  try {
    console.log('✨ Criando novo evento...');
    const novoEvento = await eventos.criarEvento(req.body);
    console.log(`✅ Evento criado: ${novoEvento.nome}`);
    res.status(201).json(novoEvento);
  } catch (error) {
    handleError(error, req, res);
  }
});

// Listar todos os eventos
router.get('/', async (req, res) => {
  try {
    const todosEventos = await eventos.listarEventos();
    console.log(`✅ ${todosEventos.length} eventos encontrados`);
    res.status(200).json(todosEventos);
  } catch (error) {
    handleError(error, req, res);
  }
});

// Obter evento por ID
router.get('/:id', validateId, async (req, res) => {
  try {
    const eventId = req.params.id;
    console.log(`🔍 Buscando evento ID: ${eventId}`);
    const eventoEncontrado = await eventos.buscarEventoPorId(eventId);

    if (!eventoEncontrado) {
      return res.status(404).json({
        error: 'Evento não encontrado',
        message: `Nenhum evento encontrado com ID: ${eventId}`,
        id: eventId,
        code: 'EVENT_NOT_FOUND'
      });
    }

    console.log(`✅ Evento encontrado: ${eventoEncontrado.nome}`);
    res.status(200).json(eventoEncontrado);
  } catch (error) {
    handleError(error, req, res);
  }
});

// Atualizar evento
router.put('/:id', validateId, validateEventData, async (req, res) => {
  try {
    const eventId = req.params.id;
    console.log(`📝 Atualizando evento ID: ${eventId}`);

    const eventoAtualizado = await eventos.atualizarEvento(eventId, req.body);

    if (!eventoAtualizado) {
      return res.status(404).json({
        error: 'Evento não encontrado',
        message: `Nenhum evento encontrado com ID: ${eventId} para atualização`,
        id: eventId,
        code: 'EVENT_NOT_FOUND'
      });
    }

    console.log(`✅ Evento atualizado: ${eventoAtualizado.nome}`);
    res.status(200).json(eventoAtualizado);
  } catch (error) {
    handleError(error, req, res);
  }
});

// Deletar evento
router.delete('/:id', validateId, async (req, res) => {
  try {
    const eventId = req.params.id;
    console.log(`🗑️ Deletando evento ID: ${eventId}`);

    const eventoDeletado = await eventos.deletarEvento(eventId);

    if (!eventoDeletado) {
      return res.status(404).json({
        error: 'Evento não encontrado',
        message: `Nenhum evento encontrado com ID: ${eventId} para exclusão`,
        id: eventId,
        code: 'EVENT_NOT_FOUND'
      });
    }

    console.log(`✅ Evento deletado: ${eventoDeletado.nome}`);
    res.status(200).json(eventoDeletado);
  } catch (error) {
    handleError(error, req, res);
  }
});

export default router;