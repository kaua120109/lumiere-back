// src/middleware/auth.js
import { verifyToken } from "../jwt.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Middleware para verificar a autenticidade do token JWT e popular req.usuario.
 * Popula req.usuario com os dados do payload do token, incluindo status de membro.
 */
export const verificarAutenticacao = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token de autenticação não fornecido ou formato inválido." });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token); // Usa a função de verificação para decodificar

    // Popula req.usuario com os dados do token.
    // É importante usar os nomes dos campos como estão no payload do token.
    req.usuario = {
      usuarioid: decoded.usuarioid, // O ID padronizado do usuário
      nome: decoded.nome,
      usuario: decoded.usuario,
      admin: decoded.admin || false,
      pontos: decoded.pontos || 0,
      nivelMembro: decoded.nivelMembro || 1,
      ehMembro: decoded.ehMembro || false, // Propriedade ehMembro do token
      membroAtivo: decoded.membroAtivo || false, // Propriedade membroAtivo do token
    };

    console.log("Usuário autenticado (do token):", req.usuario);
    next();
  } catch (error) {
    console.error("Erro de autenticação no middleware:", error.message);
    // Erros específicos para tratamento no frontend (token expirado, inválido)
    if (error.message.includes("Token expirado")) {
      return res.status(401).json({ message: "Sessão expirada. Faça login novamente.", errorType: "expired" });
    }
    return res.status(401).json({ message: "Token inválido ou não autorizado.", errorType: "invalid" });
  }
};

/**
 * Middleware para verificar se o usuário autenticado possui privilégios de administrador.
 * Deve ser usado APÓS verificarAutenticacao.
 */
export const verificarAdmin = (req, res, next) => {
  // req.usuario já foi populado por verificarAutenticacao
  if (!req.usuario || !req.usuario.admin) {
    return res.status(403).json({ message: "Acesso restrito a administradores." });
  }
  next();
};

/**
 * Middleware para verificar se o usuário autenticado é um membro ativo.
 * Realiza uma consulta ao banco de dados para garantir o status mais atualizado.
 * Deve ser usado APÓS verificarAutenticacao.
 */
export const verificarMembroAtivo = async (req, res, next) => {
  try {
    // Verifica se o usuárioid está disponível na requisição (populado por verificarAutenticacao)
    if (!req.usuario || !req.usuario.usuarioid) {
      return res.status(401).json({ message: "Dados de usuário ausentes. Autenticação necessária." });
    }

    // Consulta ao banco de dados para obter o status de membro mais atualizado
    const membro = await prisma.membro.findUnique({
      where: { usuarioid: req.usuario.usuarioid }, // Prisma usa camelCase por padrão para relacionamentos
    });

    if (!membro) {
      return res.status(403).json({ message: "Acesso negado. Você não possui uma conta de membro ativa." });
    }

    // Verifica se o membro está ativo e se a data de expiração não passou
    const ativo = membro.ativo && (!membro.dataExpiracao || new Date(membro.dataExpiracao) > new Date());

    if (!ativo) {
      return res.status(403).json({ message: "Seu status de membro não está ativo ou expirou." });
    }

    // Opcional: Atualiza o req.usuario com os dados de membro mais recentes, se necessário para rotas subsequentes
    req.usuario.ehMembro = true;
    req.usuario.membroAtivo = true;

    next();
  } catch (error) {
    console.error("Erro ao verificar membro ativo no middleware:", error);
    res.status(500).json({ message: "Erro interno ao verificar permissões de membro." });
  }
};