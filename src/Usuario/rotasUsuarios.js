// src/rotasUsuarios.js
import { Router } from "express";
import { usuario } from "./repoUsuarios.js"; // Caminho da importação do repositório
import { verificarAutenticacao, verificarAdmin, verificarMembroAtivo } from "../middleware/auth.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

/**
 * @route POST /usuarios/registrar
 * @description Registra uma nova conta de usuário. Pode registrar como membro se ehCadastroMembro for true.
 * @access Público
 */
router.post("/registrar", async (req, res) => {
  try {
    // A propriedade ehCadastroMembro vem do frontend, se a rota de cadastro for de membro
    const novoUsuario = await usuario.criarUsuario({ ...req.body, ehCadastroMembro: req.body.ehCadastroMembro || false });
    res.status(201).json({
      mensagem: "Usuário registrado com sucesso.",
      idUsuario: novoUsuario.usuarioid, // Retornar apenas dados essenciais
    });
  } catch (error) {
    const errorMessage = error.message;
    // Erros 400 para problemas de validação ou conflito (email/usuário já existem)
    const statusCode = errorMessage.includes("já está registrado") || errorMessage.includes("já está em uso") ? 400 : 500;

    res.status(statusCode).json({
      mensagem: "Falha ao registrar usuário.",
      erro: errorMessage,
    });
  }
});

/**
 * @route POST /usuarios/login
 * @description Autentica um usuário e retorna um token JWT com informações de membro.
 * @access Público
 */
router.post("/login", async (req, res) => {
  try {
    const { usuario: identificador, senha } = req.body;
    const resultado = await usuario.autenticarUsuario({ identificador, senha });

    // O resultado já contém o token e os dados do usuário com ehMembro/membroAtivo
    res.status(200).json({
      mensagem: "Login realizado com sucesso!",
      token: resultado.token,
      usuario: resultado.usuario, // Contém ehMembro e membroAtivo
    });
  } catch (error) {
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
    // req.usuario é populado pelo middleware verificarAutenticacao
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
    // Usa o ID do usuário do token para buscar o perfil completo e atualizado
    const perfilUsuario = await usuario.obterPerfilUsuario(req.usuario.usuarioid);
    res.status(200).json(perfilUsuario);
  } catch (error) {
    console.error("Erro ao recuperar perfil do usuário:", error);
    res.status(500).json({ mensagem: "Falha ao recuperar perfil do usuário." });
  }
});

/**
 * @route GET /usuarios/overclub
 * @description Acessa a área exclusiva para membros.
 * @access Privado (Membros Ativos)
 */
router.get("/overclub", verificarAutenticacao, verificarMembroAtivo, (req, res) => {
  try {
    res.status(200).json({
      mensagem: "Bem-vindo à Área Exclusiva de Membros! Você é um membro ativo.",
      usuario: req.usuario, // Dados do usuário já com status de membro verificado pelo middleware
    });
  } catch (error) {
    console.error("Erro ao acessar área de membro:", error);
    res.status(403).json({ mensagem: "Acesso à área de membro negado." }); // 403 Proibido
  }
});

/**
 * @route POST /usuarios/ativar-membro
 * @description Ativa ou cria um registro de membro para o usuário autenticado e retorna um NOVO token com o status atualizado.
 * @access Privado (Usuários Autenticados)
 */
router.post("/ativar-membro", verificarAutenticacao, async (req, res) => {
  try {
    console.log('=== ATIVANDO MEMBRO ===');
    console.log('Dados do usuário:', req.usuario);
    
    const usuarioId = req.usuario.usuarioid;
    const nomeUsuario = req.usuario.nome; // Pega o nome do usuário do token atual

    console.log('Usuarioid:', usuarioId);
    console.log('Nome do usuário:', nomeUsuario);

    // Usa upsert para criar ou atualizar o registro de membro, garantindo que o membro exista e esteja ativo
    const membro = await prisma.membro.upsert({
      where: { usuarioid: usuarioId },
      update: { ativo: true }, // Apenas atualiza o status para ativo se já existir
      create: {
        usuarioid: usuarioId,
        nome: nomeUsuario, // Usa o nome do usuário do token para criar, se necessário
        dataInicio: new Date(),
        ativo: true,
      },
    });

    console.log('Membro criado/atualizado:', membro);

    // Gera e retorna um NOVO TOKEN com os dados atualizados do usuário (incluindo status de membro)
    const { token: novoToken, usuario: usuarioAtualizado } = await usuario.gerarNovoTokenComDadosAtualizados(usuarioId);

    console.log('Novo token gerado:', !!novoToken);
    console.log('Usuário atualizado:', usuarioAtualizado);

    res.status(200).json({
      mensagem: "Membro ativado com sucesso! Seu status foi atualizado.",
      token: novoToken, // Retorna o novo token
      usuario: usuarioAtualizado, // Retorna os dados atualizados do usuário (com ehMembro: true, membroAtivo: true)
      membro: {
        id: membro.membroid, // Ajustado para 'membroid' se for o campo correto na sua tabela
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