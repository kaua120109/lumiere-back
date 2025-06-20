// src/Usuario/repoUsuarios.js
import { PrismaClient } from "@prisma/client";
import { createToken } from "../jwt.js";
import { adicionarPontos } from '../services/pontosService.js'; // Assumindo que este caminho está correto
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
   * @returns {Promise<object>} O objeto do usuário recém-criado (sem a senha).
   * @throws {Error} Se um email ou nome de usuário já existir.
   */
  async criarUsuario(dadosUsuario) {
    try {
      const {
        usuario: nomeUsuario, // Renomeado para evitar conflito com o objeto 'usuario'
        cpf,
        senha,
        celular,
        nome,
        admin = false,
        email,
        ehCadastroMembro = false
      } = dadosUsuario;

      // Verifica se o email já está em uso
      const usuarioExistentePorEmail = await prisma.usuario.findUnique({
        where: { email: email },
      });
      if (usuarioExistentePorEmail) {
        throw new Error("Email já está registrado.");
      }

      // Verifica se o nome de usuário já está em uso
      const usuarioExistentePorNomeUsuario = await prisma.usuario.findUnique({
        where: { usuario: nomeUsuario }, // Usar nomeUsuario aqui
      });
      if (usuarioExistentePorNomeUsuario) {
        throw new Error("Nome de usuário já está em uso.");
      }

      const salt = await bcrypt.genSalt(10);
      const senhaCriptografada = await bcrypt.hash(senha, salt);

      const novoUsuario = await prisma.usuario.create({
        data: {
          usuario: nomeUsuario, // Usar nomeUsuario aqui
          cpf,
          senha: senhaCriptografada,
          celular,
          nome,
          admin,
          pontos: 0, // Inicializar com 0 pontos
          nivelMembro: 1, // Inicializar no nível 1
          email,
        },
        select: { // Seleciona apenas os campos que você deseja retornar, excluindo a senha
          usuarioid: true,
          usuario: true,
          cpf: true,
          celular: true,
          nome: true,
          admin: true,
          pontos: true,
          nivelMembro: true,
          email: true,
        }
      });

      // Se for um cadastro de membro, criar um registro de membro correspondente
      if (ehCadastroMembro) {
        await prisma.membro.create({
          data: {
            usuarioid: novoUsuario.usuarioid,
            nome: novoUsuario.nome,
            dataInicio: new Date(),
            ativo: true, // Padrão ativo para novos cadastros de membro
          },
        });
      }

      // Adicionar pontos de boas-vindas
      const pontosBemVindo = 100;
      await adicionarPontos(novoUsuario.usuarioid, pontosBemVindo);

      return novoUsuario;
    } catch (error) {
      console.error("[Repositório] Erro durante o registro do usuário:", error.message);
      // Re-lançar erros específicos para tratamento no controlador
      if (error.message.includes("Email já está registrado.") || error.message.includes("Nome de usuário já está em uso.")) {
        throw error;
      }
      throw new Error("Não foi possível registrar o usuário. Tente novamente mais tarde.");
    }
  },

  /**
   * Autentica um usuário e gera um token JWT com informações de membro.
   * @param {object} credenciais - Credenciais de login do usuário.
   * @param {string} credenciais.identificador - Nome de usuário ou email.
   * @param {string} credenciais.senha - Senha do usuário.
   * @returns {Promise<object>} Um objeto contendo o token JWT e detalhes do usuário.
   * @throws {Error} Se a autenticação falhar devido a credenciais inválidas.
   */
  async autenticarUsuario(credenciais) {
    try {
      const { identificador, senha: entradaSenha } = credenciais;

      // Buscar o usuário pelo nome de usuário OU email e incluir dados de membro
      const usuarioEncontrado = await prisma.usuario.findFirst({
        where: {
          OR: [{ usuario: identificador }, { email: identificador }],
        },
        include: {
          membro: true, // Incluir dados de membro para verificar status
        },
      });

      if (!usuarioEncontrado) {
        throw new Error("Credenciais inválidas. Verifique seu usuário/email e senha.");
      }

      // Comparar a senha fornecida com a senha criptografada
      const senhaEhValida = await bcrypt.compare(entradaSenha, usuarioEncontrado.senha);

      if (!senhaEhValida) {
        throw new Error("Credenciais inválidas. Verifique seu usuário/email e senha.");
      }

      // Determinar status de membro e se está ativo
      const ehMembro = !!usuarioEncontrado.membro;
      const membroEhAtivo = ehMembro
        ? usuarioEncontrado.membro.ativo && (!usuarioEncontrado.membro.dataExpiracao || new Date(usuarioEncontrado.membro.dataExpiracao) > new Date())
        : false;

      // Payload do token JWT, incluindo dados de membro
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

      // Retornar dados essenciais do usuário e o token
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
      // Lançar erro específico para ser capturado no controlador
      if (error.message.includes("Credenciais inválidas")) {
        throw error;
      }
      throw new Error("Falha na autenticação. Tente novamente mais tarde.");
    }
  },

  /**
   * Recupera o perfil de um usuário pelo seu ID, incluindo status de membro.
   * @param {number} idUsuario - O ID do usuário a ser recuperado.
   * @returns {Promise<object>} Os dados do perfil do usuário (sem a senha).
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
        },
      });

      if (!perfilUsuario) {
        throw new Error("Usuário não encontrado.");
      }

      // Determinar status de membro e se está ativo
      const ehMembro = !!perfilUsuario.membro;
      const membroEhAtivo = ehMembro
        ? perfilUsuario.membro.ativo && (!perfilUsuario.membro.dataExpiracao || new Date(perfilUsuario.membro.dataExpiracao) > new Date())
        : false;

      // Retornar o perfil com os campos ehMembro e membroAtivo
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

  /**
   * Obtém os dados mais recentes de um usuário e gera um novo token com base neles.
   * Usado após atualizações de perfil, como a ativação de membro.
   * @param {number} usuarioId - O ID do usuário.
   * @returns {Promise<{token: string, usuario: object}>} O novo token e os dados atualizados do usuário.
   * @throws {Error} Se o usuário não for encontrado.
   */
  async gerarNovoTokenComDadosAtualizados(usuarioId) {
    try {
      console.log('=== GERANDO NOVO TOKEN ===');
      console.log('Usuarioid:', usuarioId);
      
      const usuarioAtualizado = await prisma.usuario.findUnique({
        where: { usuarioid: usuarioId },
        include: {
          membro: true, // Incluir dados de membro
        },
        select: {
          usuarioid: true,
          usuario: true,
          nome: true,
          admin: true,
          pontos: true,
          nivelMembro: true,
          email: true,
          membro: true, // Selecionar também o relacionamento de membro
        }
      });

      console.log('Usuário encontrado:', usuarioAtualizado);

      if (!usuarioAtualizado) {
        throw new Error("Usuário não encontrado para gerar novo token.");
      }

      // Determinar status de membro atualizado
      const ehMembro = !!usuarioAtualizado.membro;
      const membroEhAtivo = ehMembro
        ? usuarioAtualizado.membro.ativo && (!usuarioAtualizado.membro.dataExpiracao || new Date(usuarioAtualizado.membro.dataExpiracao) > new Date())
        : false;

      console.log('Status de membro:', { ehMembro, membroEhAtivo });

      // Payload do token JWT com dados atualizados
      const payloadToken = {
        usuarioid: usuarioAtualizado.usuarioid,
        nome: usuarioAtualizado.nome,
        usuario: usuarioAtualizado.usuario,
        admin: usuarioAtualizado.admin,
        pontos: usuarioAtualizado.pontos,
        nivelMembro: usuarioAtualizado.nivelMembro,
        ehMembro: ehMembro,
        membroAtivo: membroEhAtivo,
      };

      console.log('Payload do token:', payloadToken);

      const novoToken = createToken(payloadToken);

      console.log('Token gerado com sucesso');

      return {
        token: novoToken,
        usuario: {
          usuarioid: usuarioAtualizado.usuarioid,
          nome: usuarioAtualizado.nome,
          usuario: usuarioAtualizado.usuario,
          admin: usuarioAtualizado.admin,
          pontos: usuarioAtualizado.pontos,
          nivelMembro: usuarioAtualizado.nivelMembro,
          ehMembro: ehMembro,
          membroAtivo: membroEhAtivo,
        },
      };

    } catch (error) {
      console.error("[Repositório] Erro ao gerar novo token com dados atualizados:", error.message);
      throw error;
    }
  },
};