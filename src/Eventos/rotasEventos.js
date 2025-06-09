import { Router } from 'express';
import { eventos } from './eventos.js';

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
  
  if (error.message.includes('banco de dados')) {
    return res.status(503).json({
      error: 'Serviço indisponível',
      message: 'Problemas de conexão com o banco de dados',
      code: 'DATABASE_CONNECTION_ERROR'
    });
  }
  
  if (error.message.includes('não encontrada')) {
    return res.status(500).json({
      error: 'Erro de configuração',
      message: 'Tabela de eventos não encontrada. Execute as migrations.',
      code: 'TABLE_NOT_FOUND'
    });
  }
  
  if (error.message.includes('ID inválido')) {
    return res.status(400).json({
      error: 'Parâmetro inválido',
      message: 'ID do evento deve ser um número válido',
      code: 'INVALID_ID'
    });
  }
  
  return res.status(500).json({
    error: 'Erro interno do servidor',
    message: error.message,
    code: 'INTERNAL_SERVER_ERROR'
  });
};

// Validação para criação/atualização de eventos
const validateEventData = (req, res, next) => {
  const { nome, data, local } = req.body;
  
  // Campos obrigatórios
  const requiredFields = ['nome', 'data', 'local'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    return res.status(400).json({
      error: 'Dados inválidos',
      message: `Campos obrigatórios faltando: ${missingFields.join(', ')}`,
      code: 'MISSING_REQUIRED_FIELDS'
    });
  }
  
  // Validação de data
  const dataEvento = new Date(data);
  if (isNaN(dataEvento.getTime())) {
    return res.status(400).json({
      error: 'Data inválida',
      message: 'Formato de data deve ser válido',
      code: 'INVALID_DATE_FORMAT'
    });
  }
  
  // Validação de tamanho dos campos
  if (nome.length > 255) {
    return res.status(400).json({
      error: 'Nome muito longo',
      message: 'Nome do evento deve ter no máximo 255 caracteres',
      code: 'NAME_TOO_LONG'
    });
  }
  
  next();
};

// Middleware para validar ID
const validateId = (req, res, next) => {
  const { id } = req.params;
  
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({
      error: 'ID inválido',
      message: 'ID deve ser um número inteiro positivo',
      code: 'INVALID_ID_FORMAT'
    });
  }
  
  try {
    BigInt(id);
    next();
  } catch (error) {
    return res.status(400).json({
      error: 'ID inválido',
      message: 'ID fornecido é muito grande ou inválido',
      code: 'INVALID_ID_RANGE'
    });
  }
};

// ROTAS CORRIGIDAS:

// Rota de teste de conexão
router.get('/health', async (req, res) => {
  try {
    await eventos.testarConexao();
    res.status(200).json({
      status: 'OK',
      message: 'Conexão com banco de dados funcionando',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleError(error, req, res);
  }
});

// Listar todos os eventos (CORRIGIDO - removendo /eventos duplicado)
router.get('/', async (req, res) => {
  try {
    console.log('📋 Iniciando listagem de eventos...');
    
    const listaDeEventos = await eventos.listarEventos();
    
    console.log(`✅ Retornando ${listaDeEventos.length} eventos`);
    
    // Retorna diretamente o array para compatibilidade com o frontend
    res.status(200).json(listaDeEventos);
    
  } catch (error) {
    handleError(error, req, res);
  }
});

// Buscar evento por ID
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

// Criar novo evento (CORRIGIDO - removendo /eventos duplicado)
router.post('/', validateEventData, async (req, res) => {
  try {
    console.log('➕ Criando novo evento:', req.body.nome);
    
    const novoEvento = await eventos.criarEvento(req.body);
    
    console.log(`✅ Evento criado com sucesso: ${novoEvento.nome}`);
    res.status(201).json(novoEvento);
    
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
    res.status(200).json({ 
      success: true,
      message: "Evento deletado com sucesso",
      data: eventoDeletado
    });
    
  } catch (error) {
    handleError(error, req, res);
  }
});

export default router;