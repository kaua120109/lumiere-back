import express from "express"
import * as membroController from "./membro.js"

const router = express.Router()

// Rotas básicas de membro
router.post("/inscricao", membroController.cadastrarInscricaoMembro)
router.post("/cadastro-membro", membroController.cadastrarMembro)
router.post("/login-membro", membroController.loginMembro)
router.post("/login", membroController.loginMembro)

export default router
