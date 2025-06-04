import { Router } from "express"
import { usuario } from "./repoUsuarios.js"
import { verificarAutenticacao, verificarAdmin } from "../middleware/auth.js"  // Ajuste o caminho

const router = Router()

router.post("/cadastro", async (req, res) => {
  try {
    console.log("Requisição de cadastro recebida:", req.body) //
    const novoUsuario = await usuario.cadastroUsuario(req.body) //
    res.status(201).json({
      message: "Usuário cadastrado com sucesso", //
      usuario: novoUsuario, //
    })
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error) //
    res.status(500).json({
      message: "Erro ao cadastrar usuário.", //
      error: error.message, //
    })
  }
})

router.post("/login", async (req, res) => {
  try {
    console.log("Requisição de login recebida para:", req.body.usuario) //
    const result = await usuario.login(req.body) //

    console.log("Login bem-sucedido, enviando resposta") //
    res.status(200).json({
      message: "Login bem-sucedido!", //
      token: result.token, //
      usuario: {
        usuarioid: result.usuario.usuarioid, //
        nome: result.usuario.nome, //
        admin: result.usuario.admin, //
        pontos: result.usuario.pontos, // Incluído na resposta de login
        nivelMembro: result.usuario.nivelMembro, // Incluído na resposta de login
      },
    })
  } catch (error) {
    console.error("Erro ao fazer login:", error) //
    res.status(401).json({
      message: "Falha no login.", //
      error: error.message, //
    })
  }
})

// Rota de exemplo que requer autenticação
router.get("/autenticado", verificarAutenticacao, (req, res) => {
  try {
    res.status(200).json({
      message: "Usuário autenticado com sucesso!", //
      usuario: req.usuario, // Retorna os dados do usuário do token (incluindo pontos e nível)
      // Você pode adicionar mais dados do usuário aqui se necessário
    })
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error) //
    res.status(500).json({ message: "Erro ao verificar autenticação." }) //
  }
})

router.get("/verificar-admin", verificarAutenticacao, async (req, res) => {
  try {
    res.status(200).json({
      admin: req.usuario.admin, //
      usuarioid: req.usuario.usuarioid, //
      nome: req.usuario.nome, //
    })
  } catch (error) {
    console.error("Erro ao verificar admin:", error) //
    res.status(500).json({ message: "Erro ao verificar permissões de administrador." }) //
  }
})

/**
 * CORREÇÃO: Nova rota para obter perfil do usuário
 * Retorna o perfil completo do usuário, incluindo pontos e nível
 */
router.get("/perfil", verificarAutenticacao, async (req, res) => {
  try {
    const perfilUsuario = await usuario.obterPerfil(req.usuario.usuarioid) //
    res.status(200).json({
      usuario: perfilUsuario, //
    })
  } catch (error) {
    console.error("Erro ao obter perfil:", error) //
    res.status(500).json({ message: "Erro ao obter perfil do usuário." }) //
  }
})

export default router