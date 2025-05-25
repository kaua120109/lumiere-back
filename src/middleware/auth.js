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
    
    // Adiciona os dados do usuário ao objeto request
    req.usuario = {
      usuarioid: decoded.id,
      nome: decoded.nome,
      admin: decoded.admin
    };
    
    // Continua para a próxima função/middleware
    next();
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

export const verificarAdmin = (req, res, next) => {
  // Verifica se o usuário está autenticado e tem permissão de admin
  if (!req.usuario || !req.usuario.admin) {
    return res.status(403).json({ message: 'Acesso restrito a administradores' });
  }
  
  // Se for admin, continua para o próximo middleware/função
  next();
};

// Novo middleware para verificar se o usuário é um membro ativo
export const verificarMembroAtivo = async (req, res, next) => {
  try {
    // Verifica se o usuário está autenticado
    if (!req.usuario || !req.usuario.usuarioid) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    
    // Verificar se o usuário é um membro
    const membro = await prisma.membro.findUnique({
      where: { usuarioId: req.usuario.usuarioid }
    });
    
    if (!membro) {
      return res.status(403).json({ message: 'Acesso negado. Você precisa ser um membro para acessar esta área.' });
    }
    
    // Verificar se o membro está ativo e se a assinatura não expirou
    const ativo = membro.ativo && 
                 (!membro.dataExpiracao || new Date(membro.dataExpiracao) > new Date());
    
    if (!ativo) {
      return res.status(403).json({ message: 'Acesso negado. Sua assinatura está inativa ou expirada.' });
    }
    
    // Adicionar informações do membro ao objeto de requisição
    req.membro = membro;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao verificar status de membro.' });
  }
};