import { Router } from "express";
import { usuario } from "./repoUsuarios.js";
import { cadastrarMembro } from './membro.js';
import { verificarAutenticacao, verificarAdmin } from '../middleware/auth.js';


const router = Router();
router.post('/cadastroMembro', cadastrarMembro);

router.post("/cadastro", async (req, res) => {
  try {
    const novoUsuario = await usuario.cadastroUsuario(req.body);
    res.status(200).json(novoUsuario);
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    res.status(500).json({ message: "Erro ao cadastrar usuário." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const result = await usuario.login(req.body);
    res.status(200).json({ 
      message: "Login bem-sucedido!",
      token: result.token,
      usuario: result.usuario
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(401).json({ 
      message: error.message || "Credenciais inválidas" 
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