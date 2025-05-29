import { PrismaClient } from "@prisma/client";
import { createToken } from "../jwt.js";

const prisma = new PrismaClient();

export const usuario = {
  async cadastroUsuario(dados) {
    console.log("Dados recebidos para cadastro:", dados);
    try {
      const novoUsuario = await prisma.usuario.create({
        data: {
          usuario: dados.usuario,
          cpf: dados.cpf,
          senha: dados.senha,
          celular: dados.celular,
          nome: dados.nome,
          admin: dados.admin || false,
        },
      });
      console.log("Usuário cadastrado com sucesso:", novoUsuario);
      return novoUsuario;
    } catch (error) {
      console.error("Erro ao cadastrar o usuário:", error);
      throw error;
    }
  },

  async login(dados) {
    console.log("Tentativa de login para:", dados.usuario);
    try {
      const usuarioEncontrado = await prisma.usuario.findFirst({
        where: {
          usuario: dados.usuario,
          senha: dados.senha
        }
      });
  
      if (!usuarioEncontrado) {
        console.log("Usuário não encontrado ou senha incorreta");
        throw new Error("Usuário ou senha incorretos");
      }
  
      console.log("Usuário encontrado:", usuarioEncontrado.nome);
      
      // CORREÇÃO: Usar 'iduser' conforme esperado no JWT
      const token = createToken({ 
        id: usuarioEncontrado.usuarioid,  // Mudança aqui
        iduser: usuarioEncontrado.usuarioid,  
        nome: usuarioEncontrado.nome,
        admin: usuarioEncontrado.admin 
      });

      console.log("Token criado com sucesso");
  
      return { 
        token, 
        usuario: {
          usuarioid: usuarioEncontrado.usuarioid,
          nome: usuarioEncontrado.nome,
          usuario: usuarioEncontrado.usuario,
          admin: usuarioEncontrado.admin
        }
      };
  
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  },

  async verificarAdmin(usuarioid) {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { usuarioid: parseInt(usuarioid) }
      });

      if (!usuario) {
        throw new Error("Usuário não encontrado");
      }

      return { admin: usuario.admin };
    } catch (error) {
      throw error;
    }
  }
};