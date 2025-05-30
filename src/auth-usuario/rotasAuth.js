import express from 'express'
import { loginComGoogle } from './repoAuth.js'

const router = express.Router()

// Rota para login com Google
router.post('/google', loginComGoogle)

export default router