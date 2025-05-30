import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secreta"
const EXPIRATION = "7d"

/**
 * Gera um token JWT para o usuário.
 * CORREÇÃO: Padronização dos campos do token
 */
export const createToken = (user) => {
  if (!user || (!user.iduser && !user.usuarioid)) {
    throw new Error("Dados de usuário inválidos para criação de token")
  }

  // CORREÇÃO: Padronizar campos do token
  const payload = {
    id: user.iduser || user.usuarioid,
    iduser: user.iduser || user.usuarioid,
    usuarioid: user.iduser || user.usuarioid,
    nome: user.nome,
    admin: user.admin || false,
  }

  console.log("Criando token com payload:", payload)

  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRATION })
    return token
  } catch (error) {
    throw new Error("Erro na geração do token: " + error.message)
  }
}

/**
 * Middleware para verificar token JWT em rotas protegidas.
 */
export const verifyTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Cabeçalho Authorization ausente ou mal formatado." })
  }

  const token = authHeader.split(" ")[1]
  if (!token || typeof token !== "string") {
    return res.status(401).json({ message: "Token não fornecido ou inválido." })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expirado. Faça login novamente.", errorType: "expired" })
    }

    return res.status(401).json({ message: "Token inválido.", errorType: "invalid", error: error.message })
  }
}

/**
 * Função para verificar um token diretamente (sem middleware).
 * CORREÇÃO: Melhor tratamento de erros e logs
 */
export const verifyToken = (token) => {
  try {
    if (!token || typeof token !== "string") {
      throw new Error("Token ausente ou inválido.")
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    console.log("Token verificado com sucesso:", {
      id: decoded.id,
      nome: decoded.nome,
      exp: new Date(decoded.exp * 1000),
    })

    return decoded
  } catch (error) {
    console.error("Erro na verificação do token:", error.message)

    if (error.name === "TokenExpiredError") {
      throw new Error("Token expirado. Por favor, faça login novamente.")
    } else if (error.name === "JsonWebTokenError") {
      throw new Error(`Token inválido: ${error.message}`)
    }

    throw new Error(`Erro na verificação do token: ${error.message}`)
  }
}
