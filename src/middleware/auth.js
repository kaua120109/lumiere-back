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
    // Logs detalhados para debug
    console.log('=== VERIFICANDO MEMBRO ATIVO ===');
    console.log('Dados do usuário:', req.usuario);
    console.log('Usuarioid:', req.usuario?.usuarioid);
    
    // Verifica se o usuárioid está disponível na requisição (populado por verificarAutenticacao)
    if (!req.usuario || !req.usuario.usuarioid) {
      console.log('Erro: Dados de usuário ausentes');
      return res.status(401).json({ message: "Dados de usuário ausentes. Autenticação necessária." });
    }

    // Consulta ao banco de dados para obter o status de membro mais atualizado
    console.log('Consultando banco de dados para usuarioid:', req.usuario.usuarioid);
    const usuario = await prisma.usuario.findUnique({
      where: { usuarioid: req.usuario.usuarioid },
      select: {
        ehMembro: true,
        membroAtivo: true,
        dataExpiracao: true,
      }
    });

    console.log('Dados do usuário encontrados:', usuario);

    if (!usuario || !usuario.ehMembro) {
      console.log('Erro: Usuário não é membro ativo no banco de dados');
      return res.status(403).json({ message: "Acesso negado. Você não possui uma conta de membro ativa." });
    }

    // Verifica se o membro está ativo e se a data de expiração não passou
    const ativo = usuario.membroAtivo && (!usuario.dataExpiracao || new Date(usuario.dataExpiracao) > new Date());
    console.log('Status de ativo:', ativo);
    console.log('Data de expiração:', usuario.dataExpiracao);
    console.log('Data atual:', new Date());

    if (!ativo) {
      console.log('Erro: Membro não está ativo ou expirou');
      return res.status(403).json({ message: "Seu status de membro não está ativo ou expirou." });
    }

    // Opcional: Atualiza o req.usuario com os dados de membro mais recentes
    req.usuario.ehMembro = true;
    req.usuario.membroAtivo = true;

    console.log('Verificação concluída com sucesso - Membro ativo');
    next();
  } catch (error) {
    console.error("Erro ao verificar membro ativo no middleware:", error);
    res.status(500).json({ message: "Erro interno ao verificar permissões de membro." });
  }
};