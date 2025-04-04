import { PrismaClient } from "@prisma/client";
import { createToken } from "../jwt.js";

const prisma = new PrismaClient();

export const usuario = {
  async cadastroUsuario(dados) {
    console.log(dados)
    try {
      const novoUsuario = await prisma.usuario.create({
        data: {
          usuario: dados.usuario,
          cpf: dados.cpf,
          senha: dados.senha,
          celular: dados.celular,
          nome: dados.nome,
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
        iduser: usuarioEncontrado.id,  // Supondo que o campo ID se chame 'id'
        nome: usuarioEncontrado.nome 
      });
  
      return { token, usuario: usuarioEncontrado };
  
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    }
  }
};

