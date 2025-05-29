import { verifyToken } from '../jwt.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const verificarAutenticacao = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    // CORREÇÃO: Usar os campos corretos do token
    req.usuario = {
      usuarioid: decoded.id || decoded.iduser, // Aceita ambos os formatos
      nome: decoded.nome,
      admin: decoded.admin
    };
    
    next();
  } catch (error) {
    console.error("Erro na verificação do token:", error);
    return res.status(401).json({ message: 'Token inválido' });
  }
};

export const verificarAdmin = (req, res, next) => {
  if (!req.usuario || !req.usuario.admin) {
    return res.status(403).json({ message: 'Acesso restrito a administradores' });
  }
  
  next();
};