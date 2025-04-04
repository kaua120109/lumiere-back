import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET || 'seuSegredoSuperSeguro';

// Função para gerar token
// jwt.js - Corrigir a função createToken
export const createToken = (user) => {
  const token = jwt.sign(
    {
      id: user.iduser, // Alterado para iduser para corresponder ao seu schema
      nome: user.nome
    },
    secretKey,
    { expiresIn: '1h' }
  );
  return token; // Retornar apenas o token
};

// Middleware de verificação
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Formato de token inválido!' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Token inválido ou expirado',
      error: error.message
    });
  }
};

