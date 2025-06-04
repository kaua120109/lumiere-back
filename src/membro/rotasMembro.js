import express from "express"
import * as membroController from "./membro.js" // Ajuste o caminho

const router = express.Router()

// Rotas básicas de membro
// router.post("/api/inscricao", membroController.cadastrarInscricaoMembro)
// router.post("/api/cadastro-membro", membroController.cadastrarMembro) // Pode ser redundante com /inscricao
// router.post("/api/login", membroController.loginMembro)
// router.post("/api/login", membroController.loginMembro) // Adicionado para consistência, se o login for o mesmo

export default router