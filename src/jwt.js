import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secreta_muito_segura"; // Use uma variável de ambiente forte
const EXPIRATION = "7d"; // Token expira em 7 dias

/**
 * Gera um token JWT para o usuário com um payload padronizado e completo.
 * @param {object} user - Objeto contendo dados do usuário.
 * @param {number} user.usuarioid - ID do usuário.
 * @param {string} user.nome - Nome do usuário.
 * @param {string} user.usuario - Nome de usuário (username).
 * @param {boolean} [user.admin=false] - Indica se o usuário é administrador.
 * @param {number} [user.pontos=0] - Pontos de fidelidade do usuário.
 * @param {number} [user.nivelMembro=1] - Nível de membro do usuário.
 * @param {boolean} [user.ehMembro=false] - Indica se o usuário é um membro.
 * @param {boolean} [user.membroAtivo=false] - Indica se o status de membro está ativo.
 * @returns {string} O token JWT gerado.
 * @throws {Error} Se os dados do usuário forem inválidos ou houver erro na geração.
 */
export const createToken = (user) => {
  // Validação básica dos dados essenciais para o token
  if (!user || (!user.usuarioid && !user.iduser)) {
    throw new Error("Dados de usuário inválidos ou incompletos para criação de token.");
  }

  // Define o ID principal do usuário, preferindo 'usuarioid'
  const userId = user.usuarioid || user.iduser;

  // Payload completo e padronizado do token, incluindo dados de membro
  const payload = {
    usuarioid: userId,
    nome: user.nome,
    usuario: user.usuario,
    admin: user.admin || false,
    pontos: user.pontos || 0,
    nivelMembro: user.nivelMembro || 1,
    ehMembro: user.ehMembro || false, // Adicionado ehMembro
    membroAtivo: user.membroAtivo || false, // Adicionado membroAtivo
  };

  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRATION });
    return token;
  } catch (error) {
    console.error("Erro na geração do token:", error);
    throw new Error("Erro na geração do token: " + error.message);
  }
};

/**
 * Middleware para verificar token JWT em rotas protegidas.
 * @param {object} req - Objeto de requisição Express.
 * @param {object} res - Objeto de resposta Express.
 * @param {function} next - Função para passar para o próximo middleware.
 */
export const verifyTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Cabeçalho Authorization ausente ou mal formatado." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token não fornecido ou inválido." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Adiciona os dados decodificados à requisição
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expirado. Faça login novamente.", errorType: "expired" });
    }
    console.error("Erro na verificação do token (middleware):", error.message);
    return res.status(401).json({ message: "Token inválido.", errorType: "invalid", error: error.message });
  }
};

/**
 * Função para verificar um token JWT diretamente (sem middleware).
 * @param {string} token - O token JWT a ser verificado.
 * @returns {object} O payload decodificado do token.
 * @throws {Error} Se o token for inválido ou expirado.
 */
export const verifyToken = (token) => {
  try {
    if (!token || typeof token !== "string") {
      throw new Error("Token ausente ou inválido.");
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error("Erro na verificação do token:", error.message);

    if (error.name === "TokenExpiredError") {
      throw new Error("Token expirado. Por favor, faça login novamente.");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error(`Token inválido: ${error.message}`);
    }

    throw new Error(`Erro desconhecido na verificação do token: ${error.message}`);
  }
};