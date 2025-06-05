import { Router } from "express";
import { usuario } from "./repoUsuarios.js";
import { verificarAutenticacao, verificarAdmin, verificarMembroAtivo } from "../middleware/auth.js";
import { PrismaClient } from "@prisma/client"; // Importar PrismaClient aqui para a rota de ativação

const prisma = new PrismaClient(); // Instanciar PrismaClient para uso na rota

const router = Router();

/**
 * @route POST /usuarios/registrar
 * @description Registra uma nova conta de usuário. Também pode registrar como membro.
 * @access Público
 */
router.post("/registrar", async (req, res) => {
  try {
    const novoUsuario = await usuario.criarUsuario({ ...req.body, ehCadastroMembro: req.body.ehCadastroMembro || false });
    res.status(201).json({
      mensagem: "Usuário registrado com sucesso.",
      idUsuario: novoUsuario.usuarioid, // Retornar apenas dados essenciais
    });
  } catch (error) {
    // Distinguir entre erros do lado do cliente (400) e do servidor (500)
    const errorMessage = error.message;
    const statusCode = errorMessage.includes("já está registrado") || errorMessage.includes("já está em uso") ? 400 : 500;

    res.status(statusCode).json({
      mensagem: "Falha ao registrar usuário.",
      erro: errorMessage,
    });
  }
});

/**
 * @route POST /usuarios/login
 * @description Autentica um usuário e retorna um token JWT.
 * @access Público
 */
router.post("/login", async (req, res) => {
  try {
    // Renomear 'usuario' para 'identificador' para corresponder ao repositório
    const { usuario: identificador, senha } = req.body;
    const resultado = await usuario.autenticarUsuario({ identificador, senha });

    res.status(200).json({
      mensagem: "Login realizado com sucesso!",
      token: resultado.token,
      usuario: resultado.usuario, // Contém ehMembro e membroAtivo
    });
  } catch (error) {
    // Credenciais inválidas devem retornar 401
    const statusCode = error.message.includes("Credenciais inválidas") ? 401 : 500;
    res.status(statusCode).json({
      mensagem: "Falha na autenticação.",
      erro: error.message,
    });
  }
});

/**
 * @route GET /usuarios/autenticado
 * @description Rota de teste para usuários autenticados.
 * @access Privado (Usuários Autenticados)
 */
router.get("/autenticado", verificarAutenticacao, (req, res) => {
  try {
    res.status(200).json({
      mensagem: "Autenticado com sucesso!",
      usuario: req.usuario, // Dados do usuário do payload do token
    });
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);
    res.status(500).json({ mensagem: "Erro interno do servidor durante verificação de autenticação." });
  }
});

/**
 * @route GET /usuarios/verificar-admin
 * @description Verifica se o usuário autenticado tem privilégios de administrador.
 * @access Privado (Usuários Admin)
 */
router.get("/verificar-admin", verificarAutenticacao, verificarAdmin, async (req, res) => {
  try {
    // req.usuario já contém os dados do token, incluindo 'admin'
    res.status(200).json({
      admin: req.usuario.admin,
      usuarioid: req.usuario.usuarioid,
      nome: req.usuario.nome,
    });
  } catch (error) {
    console.error("Erro ao verificar status de admin:", error);
    res.status(500).json({ mensagem: "Falha ao verificar permissões de administrador." });
  }
});

/**
 * @route GET /usuarios/perfil
 * @description Recupera o perfil do usuário autenticado.
 * @access Privado (Usuários Autenticados)
 */
router.get("/perfil", verificarAutenticacao, async (req, res) => {
  try {
    const perfilUsuario = await usuario.obterPerfilUsuario(req.usuario.usuarioid);
    res.status(200).json(perfilUsuario);
  } catch (error) {
    console.error("Erro ao recuperar perfil do usuário:", error);
    res.status(500).json({ mensagem: "Falha ao recuperar perfil do usuário." });
  }
});

/**
 * @route GET /usuarios/area-membro
 * @description Acessa a área exclusiva para membros.
 * @access Privado (Membros Ativos)
 */
router.get("/area-membro", verificarAutenticacao, verificarMembroAtivo, (req, res) => {
  try {
    res.status(200).json({
      mensagem: "Bem-vindo à Área Exclusiva de Membros! Você é um membro ativo.",
      usuario: req.usuario,
    });
  } catch (error) {
    console.error("Erro ao acessar área de membro:", error);
    res.status(403).json({ mensagem: "Acesso à área de membro negado." }); // 403 Proibido
  }
});

/**
 * @route POST /usuarios/ativar-membro
 * @description Ativa ou cria um registro de membro para o usuário autenticado.
 * @access Privado (Usuários Autenticados)
 */
router.post("/ativar-membro", verificarAutenticacao, async (req, res) => {
  try {
    const usuarioId = req.usuario.usuarioid;

    // Usar upsert para criar ou atualizar o registro de membro
    const membro = await prisma.membro.upsert({
      where: { usuarioid: usuarioId },
      update: { ativo: true }, // Apenas atualiza o status para ativo se já existir
      create: {
        usuarioid: usuarioId,
        nome: req.usuario.nome, // Pega o nome do usuário do token
        dataInicio: new Date(),
        ativo: true,
      },
    });

    res.status(200).json({
      mensagem: "Membro ativado com sucesso!",
      membro: {
        id: membro.id, // Supondo que 'id' é o ID do membro
        dataInicio: membro.dataInicio,
        ativo: membro.ativo
      }
    });
  } catch (error) {
    console.error("[Rotas] Erro ao ativar membro:", error);
    res.status(500).json({ mensagem: "Erro ao ativar membro. Tente novamente mais tarde." });
  }
});

export default router;