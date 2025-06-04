// src/router/repo/repoUsuarios.js
import { PrismaClient } from "@prisma/client"
import { createToken } from "../jwt.js"// Ajuste o caminho conforme sua estrutura
import { adicionarPontos } from '../service/pontosService.js';
 // Importa o serviço de pontos

const prisma = new PrismaClient()

export const usuario = {
  async cadastroUsuario(dados) {
    console.log("Dados recebidos para cadastro:", dados) //
    try {
      // Cria o usuário com pontos e nível inicializados
      const novoUsuario = await prisma.usuario.create({
        data: {
          usuario: dados.usuario, //
          cpf: dados.cpf, //
          senha: dados.senha, //
          celular: dados.celular, //
          nome: dados.nome, //
          admin: dados.admin || false, //
          pontos: 0, // Inicializa com 0 pontos
          nivelMembro: 1, // Inicializa no nível 1
          email: dados.email, // Garante que o email é passado
        },
      })
      console.log("Usuário cadastrado com sucesso:", novoUsuario) //

      // --- ADICIONAR PONTOS AQUI: Bônus de boas-vindas ---
      const pontosBoasVindas = 100; // Defina a quantidade de pontos de boas-vindas
      await adicionarPontos(novoUsuario.usuarioid, pontosBoasVindas);
      console.log(`[Pontos] Bônus de boas-vindas de ${pontosBoasVindas} pontos para ${novoUsuario.nome}.`);
      // --- FIM DA ADIÇÃO DE PONTOS ---

      return novoUsuario
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error) //
      throw new Error("Erro ao cadastrar usuário.") //
    }
  },

  async login(dados) {
    try {
      const usuarioEncontrado = await prisma.usuario.findFirst({
        where: {
          OR: [{ usuario: dados.usuario }, { email: dados.usuario }], // Permite login por usuario ou email
        },
      })

      if (!usuarioEncontrado) {
        throw new Error("Usuário ou senha inválidos.") //
      }

      // IMPORTANTE: Assumindo que a senha já está criptografada ao ser armazenada
      // e que você tem um método para comparar senhas (ex: bcrypt.compare)
      // Se não estiver usando bcrypt, adapte esta parte.
      const senhaCorreta = dados.senha === usuarioEncontrado.senha // Isso é APENAS PARA TESTE. Use bcrypt.compare!
      // const senhaCorreta = await bcrypt.compare(dados.senha, usuarioEncontrado.senha); // Linha correta com bcrypt

      if (!senhaCorreta) {
        throw new Error("Usuário ou senha inválidos.") //
      }

      const token = createToken({
        iduser: usuarioEncontrado.usuarioid, //
        nome: usuarioEncontrado.nome, //
        usuario: usuarioEncontrado.usuario, //
        admin: usuarioEncontrado.admin, //
        // Retornar pontos e nível no objeto do usuário logado para o frontend usar
        pontos: usuarioEncontrado.pontos,
        nivelMembro: usuarioEncontrado.nivelMembro,
      })

      return {
        token, //
        usuario: {
          usuarioid: usuarioEncontrado.usuarioid, //
          nome: usuarioEncontrado.nome, //
          usuario: usuarioEncontrado.usuario, //
          admin: usuarioEncontrado.admin, //
          pontos: usuarioEncontrado.pontos, // Incluir pontos
          nivelMembro: usuarioEncontrado.nivelMembro, // Incluir nível
        },
      }
    } catch (error) {
      console.error("Erro no login:", error) //
      throw error
    }
  },

  /**
   * CORREÇÃO: Nova função para obter perfil do usuário
   */
  async obterPerfil(usuarioid) {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { usuarioid: Number.parseInt(usuarioid) }, //
        select: {
          usuarioid: true, //
          nome: true, //
          usuario: true, //
          cpf: true, //
          celular: true, //
          admin: true, //
          pontos: true, // Incluir pontos
          nivelMembro: true, // Incluir nível
        },
      })

      if (!usuario) {
        throw new Error("Usuário não encontrado") //
      }

      return usuario
    } catch (error) {
      console.error("Erro ao obter perfil:", error) //
      throw error
    }
  },

  async verificarAdmin(usuarioid) {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { usuarioid: usuarioid },
        select: { admin: true },
      })
      return usuario?.admin || false
    } catch (error) {
      console.error("Erro ao verificar admin:", error) //
      throw error
    }
  },
}