import { PrismaClient } from "@prisma/client";
import { createToken } from "../jwt.js";

const prisma = new PrismaClient();

export const usuario = {
  async cadastroUsuario(dados) {
    console.log(dados);
    try {
      const novoUsuario = await prisma.usuario.create({
        data: {
          usuario: dados.usuario,
          cpf: dados.cpf,
          senha: dados.senha,
          celular: dados.celular,
          nome: dados.nome,
          admin: dados.admin || false, // Por padrão, não é admin
        },
      });
      return novoUsuario;
    } catch (error) {
      console.error("Erro ao cadastrar o usuário:", error);
      throw error;
    }
  },

  async login(dados) {
    try {
      const usuarioEncontrado = await prisma.usuario.findFirst({
        where: {
          usuario: dados.usuario,
          senha: dados.senha
        }
      });
  
      if (!usuarioEncontrado) {
        throw new Error("Usuário ou senha incorretos");
      }
  
      const token = createToken({ 
        iduser: usuarioEncontrado.usuarioid,  
        nome: usuarioEncontrado.nome,
        admin: usuarioEncontrado.admin 
      });
  
      return { token, usuario: usuarioEncontrado };
  
    } catch (error) {
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