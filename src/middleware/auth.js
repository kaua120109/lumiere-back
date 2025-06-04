// src/middleware/auth.js
import { verifyToken } from "../jwt.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const verificarAutenticacao = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token de autenticação não fornecido" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    // Padronização dos campos do usuário
    req.usuario = {
      usuarioid: decoded.id || decoded.iduser || decoded.usuarioid,
      nome: decoded.nome,
      admin: decoded.admin || false,
      pontos: decoded.pontos,
      nivelMembro: decoded.nivelMembro,
      isMember: decoded.isMember || false, // Adicionado
      memberAtivo: decoded.memberAtivo || false, // Adicionado
    };

    console.log("Usuário autenticado:", req.usuario);
    next();
  } catch (error) {
    console.error("Erro de autenticação:", error.message);
    return res.status(401).json({ message: error.message });
  }
};

export const verificarAdmin = (req, res, next) => {
  if (!req.usuario || !req.usuario.admin) {
    return res.status(403).json({ message: "Acesso restrito a administradores" });
  }

  next();
};

export const verificarMembroAtivo = async (req, res, next) => {
  try {
    if (!req.usuario || !req.usuario.usuarioid) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    // Consulta ao banco de dados para garantir o status mais atualizado do membro
    const membro = await prisma.membro.findUnique({
      where: { usuarioId: req.usuario.usuarioid },
    });

    if (!membro) {
      return res.status(403).json({ message: "Acesso negado. Você precisa ser um membro para acessar esta área." });
    }

    const ativo = membro.ativo && (!membro.dataExpiracao || new Date(membro.dataExpiracao) > new Date());

    if (!ativo) {
      return res.status(403).json({ message: "Seu status de membro não está ativo ou expirou." });
    }

    // Opcional: Atualizar req.usuario com dados de membro mais recentes, se necessário
    req.usuario.isMember = true;
    req.usuario.memberAtivo = ativo;

    next();
  } catch (error) {
    console.error("Erro ao verificar membro ativo:", error);
    res.status(500).json({ message: "Erro ao verificar permissões de membro." });
  }
};