// src/router/repo/repoUsuarios.js
import { PrismaClient } from "@prisma/client";
import { createToken } from "../jwt.js";
import { adicionarPontos } from '../service/pontosService.js';
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const usuario = {
  /**
   * Registra um novo usuário no sistema. Opcionalmente cria um registro de membro.
   * @param {object} dadosUsuario - Os dados para o novo usuário.
   * @param {string} dadosUsuario.usuario - O nome de usuário único.
   * @param {string} dadosUsuario.cpf - O CPF do usuário.
   * @param {string} dadosUsuario.senha - A senha do usuário (será criptografada).
   * @param {string} [dadosUsuario.celular] - O número de celular do usuário.
   * @param {string} dadosUsuario.nome - O nome completo do usuário.
   * @param {boolean} [dadosUsuario.admin=false] - Indica se o usuário é um administrador.
   * @param {string} dadosUsuario.email - O endereço de email do usuário.
   * @param {boolean} [dadosUsuario.ehCadastroMembro=false] - Indica se o registro é para uma conta de membro.
   * @returns {Promise<object>} O objeto do usuário recém-criado.
   * @throws {Error} Se um email já existir ou outros erros de registro ocorrerem.
   */
  async criarUsuario(dadosUsuario) {
    try {
      const { usuario, cpf, senha, celular, nome, admin = false, email, ehCadastroMembro = false } = dadosUsuario;

      // Verificar email existente para prevenir duplicatas
      const usuarioExistentePorEmail = await prisma.usuario.findUnique({
        where: { email: email },
      });

      if (usuarioExistentePorEmail) {
        throw new Error("Email já está registrado.");
      }

      // Verificar nome de usuário existente para prevenir duplicatas
      const usuarioExistentePorNomeUsuario = await prisma.usuario.findUnique({
        where: { usuario: usuario },
      });

      if (usuarioExistentePorNomeUsuario) {
        throw new Error("Nome de usuário já está em uso.");
      }

      const salt = await bcrypt.genSalt(10);
      const senhaCriptografada = await bcrypt.hash(senha, salt);

      const novoUsuario = await prisma.usuario.create({
        data: {
          usuario,
          cpf,
          senha: senhaCriptografada,
          celular,
          nome,
          admin,
          pontos: 0, // Inicializar com 0 pontos
          nivelMembro: 1, // Inicializar no nível 1
          email,
        },
      });

      // Se for um cadastro de membro, criar um registro de membro correspondente
      if (ehCadastroMembro) {
        await prisma.membro.create({
          data: {
            usuarioid: novoUsuario.usuarioid,
            nome: novoUsuario.nome,
            dataInicio: new Date(),
            ativo: true, // Padrão ativo para novos cadastros de membro
            // Adicionar outros dados específicos de membro aqui se necessário
          },
        });
      }

      // Adicionar pontos de boas-vindas (ex: 100 pontos por se cadastrar)
      const pontosBemVindo = 100;
      await adicionarPontos(novoUsuario.usuarioid, pontosBemVindo);

      return novoUsuario;
    } catch (error) {
      console.error("[Repositório] Erro durante o registro do usuário:", error.message);
      throw error; // Re-lançar para ser tratado pelo controlador
    }
  },

  /**
   * Autentica um usuário e gera um token JWT.
   * @param {object} credenciais - Credenciais de login do usuário.
   * @param {string} credenciais.usuario - Nome de usuário ou email.
   * @param {string} credenciais.senha - Senha do usuário.
   * @returns {Promise<object>} Um objeto contendo o token JWT e detalhes do usuário.
   * @throws {Error} Se a autenticação falhar devido a credenciais inválidas.
   */
  async autenticarUsuario(credenciais) {
    try {
      const { usuario: entradaUsuario, senha: entradaSenha } = credenciais;

      const usuarioEncontrado = await prisma.usuario.findFirst({
        where: {
          OR: [{ usuario: entradaUsuario }, { email: entradaUsuario }],
        },
        include: {
          membro: true, // Incluir dados de membro para verificação de status
        },
      });

      if (!usuarioEncontrado) {
        throw new Error("Nome de usuário ou senha inválidos.");
      }

      const senhaEhValida = await bcrypt.compare(entradaSenha, usuarioEncontrado.senha);

      if (!senhaEhValida) {
        throw new Error("Nome de usuário ou senha inválidos.");
      }

      // Determinar status de membro
      const ehMembro = !!usuarioEncontrado.membro;
      const membroEhAtivo = ehMembro
        ? usuarioEncontrado.membro.ativo && (!usuarioEncontrado.membro.dataExpiracao || new Date(usuarioEncontrado.membro.dataExpiracao) > new Date())
        : false;

      const payloadToken = {
        usuarioid: usuarioEncontrado.usuarioid,
        nome: usuarioEncontrado.nome,
        usuario: usuarioEncontrado.usuario,
        admin: usuarioEncontrado.admin,
        pontos: usuarioEncontrado.pontos,
        nivelMembro: usuarioEncontrado.nivelMembro,
        ehMembro: ehMembro,
        membroAtivo: membroEhAtivo,
      };

      const token = createToken(payloadToken);

      return {
        token,
        usuario: {
          usuarioid: usuarioEncontrado.usuarioid,
          nome: usuarioEncontrado.nome,
          usuario: usuarioEncontrado.usuario,
          admin: usuarioEncontrado.admin,
          pontos: usuarioEncontrado.pontos,
          nivelMembro: usuarioEncontrado.nivelMembro,
          ehMembro: ehMembro,
          membroAtivo: membroEhAtivo,
        },
      };
    } catch (error) {
      console.error("[Repositório] Erro durante a autenticação do usuário:", error.message);
      throw error;
    }
  },

  /**
   * Recupera o perfil de um usuário pelo seu ID.
   * @param {number} idUsuario - O ID do usuário a ser recuperado.
   * @returns {Promise<object>} Os dados do perfil do usuário.
   * @throws {Error} Se o usuário não for encontrado.
   */
  async obterPerfilUsuario(idUsuario) {
    try {
      const perfilUsuario = await prisma.usuario.findUnique({
        where: { usuarioid: Number.parseInt(idUsuario) },
        select: {
          usuarioid: true,
          nome: true,
          usuario: true,
          cpf: true,
          celular: true,
          admin: true,
          pontos: true,
          nivelMembro: true,
          email: true,
          membro: true, // Incluir dados de membro
        },
      });

      if (!perfilUsuario) {
        throw new Error("Usuário não encontrado.");
      }

      const ehMembro = !!perfilUsuario.membro;
      const membroEhAtivo = ehMembro
        ? perfilUsuario.membro.ativo && (!perfilUsuario.membro.dataExpiracao || new Date(perfilUsuario.membro.dataExpiracao) > new Date())
        : false;

      return { ...perfilUsuario, ehMembro, membroAtivo: membroEhAtivo };
    } catch (error) {
      console.error("[Repositório] Erro ao recuperar perfil do usuário:", error.message);
      throw error;
    }
  },

  /**
   * Verifica se um usuário tem privilégios de administrador.
   * @param {number} idUsuario - O ID do usuário a ser verificado.
   * @returns {Promise<boolean>} True se o usuário for um admin, false caso contrário.
   * @throws {Error} Se o usuário não for encontrado.
   */
  async verificarStatusAdmin(idUsuario) {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { usuarioid: Number.parseInt(idUsuario) },
        select: { admin: true },
      });

      if (!usuario) {
        throw new Error("Usuário não encontrado.");
      }
      return usuario.admin;
    } catch (error) {
      console.error("[Repositório] Erro ao verificar status de admin:", error.message);
      throw error;
    }
  },
};