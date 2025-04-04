import { Router } from "express";
import { usuario } from "./repoUsuarios.js";

const router = Router();

router.post("/cadastro", async (req, res) => {
  try {
    const novoUsuario = await usuario.cadastroUsuario(req.body);
    res.status(200).json(novoUsuario);
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    res.status(500).json({ message: "Erro ao cadastrar usuário." });
  }
});

// rotasUsuario.js
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

export default router; 
