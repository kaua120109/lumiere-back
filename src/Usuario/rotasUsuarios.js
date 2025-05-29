import { Router } from "express";
import { usuario } from "./repoUsuarios.js";
import { verificarAutenticacao, verificarAdmin } from '../middleware/auth.js';

const router = Router();

router.post("/cadastro", async (req, res) => {
  try {
    console.log("Requisição de cadastro recebida:", req.body);
    const novoUsuario = await usuario.cadastroUsuario(req.body);
    res.status(201).json({
      message: "Usuário cadastrado com sucesso",
      usuario: novoUsuario
    });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    res.status(500).json({ 
      message: "Erro ao cadastrar usuário.",
      error: error.message 
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    console.log("Requisição de login recebida para:", req.body.usuario);
    const result = await usuario.login(req.body);
    
    console.log("Login bem-sucedido, enviando resposta");
    res.status(200).json({ 
      message: "Login bem-sucedido!",
      token: result.token,
      usuario: result.usuario,
      success: true
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(401).json({ 
      message: error.message || "Credenciais inválidas",
      success: false
    });
  }
});

router.get("/verificar-admin", verificarAutenticacao, async (req, res) => {
  try {
    res.status(200).json({
      admin: req.usuario.admin,
      usuarioid: req.usuario.usuarioid,
      nome: req.usuario.nome
    });
  } catch (error) {
    console.error("Erro ao verificar admin:", error);
    res.status(500).json({ message: "Erro ao verificar permissões de administrador." });
  }
});

router.get("/admin/dashboard", verificarAutenticacao, verificarAdmin, (req, res) => {
  res.status(200).json({ 
    message: "Acesso autorizado à área de administração.",
    usuario: {
      id: req.usuario.usuarioid,
      nome: req.usuario.nome
    }
  });
});

export default router;