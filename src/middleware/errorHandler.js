import logger from '../logger/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error('Erro não tratado', { error: err });
  res.status(500).json({ message: 'Erro interno do servidor' });
} 