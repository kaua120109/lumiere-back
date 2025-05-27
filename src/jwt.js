import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Garantir que o JWT_SECRET seja carregado corretamente e logar para debug
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secreta';

// Aumentar o tempo de expiração para evitar problemas temporários
const EXPIRATION = '7d'; // Aumentado de 24h para 7 dias

/**
 * Gera um token JWT para o usuário.
 * @param {Object} user - Objeto do usuário (deve conter `iduser` e `nome`)
 * @returns {string} token JWT
 */
export const createToken = (user) => {
  if (!user || !user.iduser) {
    throw new Error('Dados de usuário inválidos para criação de token');
  }

  const payload = {
    id: user.iduser,
    nome: user.nome
  };

  
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRATION });
    return token;
  } catch (error) {
    throw new Error('Erro na geração do token: ' + error.message);
  }
};

/**
 * Middleware para verificar token JWT em rotas protegidas.
 */
export const verifyTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Cabeçalho Authorization ausente ou mal formatado.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token || typeof token !== 'string') {
    return res.status(401).json({ message: 'Token não fornecido ou inválido.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {

    // Verificar se o erro é de expiração
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado. Faça login novamente.', errorType: 'expired' });
    }
    
    return res.status(401).json({ message: 'Token inválido.', errorType: 'invalid', error: error.message });
  }
};

/**
 * Função para verificar um token diretamente (sem middleware).
 * @param {string} token - token JWT
 * @returns {Object} payload decodificado
 */
export const verifyToken = (token) => {
  try {
    
    if (!token || typeof token !== 'string') {
      throw new Error('Token ausente ou inválido.');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    
    // Verificar tipo específico de erro
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado. Por favor, faça login novamente.');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error(`Token inválido: ${error.message}`);
    }
    
    throw new Error(`Erro na verificação do token: ${error.message}`);
  }
};