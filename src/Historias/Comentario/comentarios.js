import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const comentarios = {
  async listarComentarios(historiaId) {
    try {
      return await prisma.comentario.findMany({
        where: {
          historiaId: BigInt(historiaId)
        },
        include: {
          usuario: {
            select: {
              nome: true,
              usuario: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error("Erro em listarComentarios:", error);
      throw error;
    }
  },

  async criarComentario(dados) {
    try {
      return await prisma.comentario.create({
        data: {
          conteudo: dados.conteudo,
          usuarioId: dados.usuarioId,
          historiaId: BigInt(dados.historiaId),
        },
        include: {
          usuario: {
            select: {
              nome: true,
              usuario: true,
            },
          },
        },
      });
    } catch (error) {
      console.error("Erro em criarComentario:", error);
      throw error;
    }
  },

  async excluirComentario(comentarioId) {
    try {
      return await prisma.comentario.delete({
        where: {
          comentarioId: BigInt(comentarioId)
        }
      });
    } catch (error) {
      console.error("Erro em excluirComentario:", error);
      throw error;
    }
  },

  async listarComentariosPorUsuario(usuarioId) {
    try {
      return await prisma.comentario.findMany({
        where: {
          usuarioId: parseInt(usuarioId)
        },
        include: {
          usuario: {
            select: {
              nome: true,
              usuario: true,
            },
          },
          historia: {
            select: {
              titulo: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error("Erro em listarComentariosPorUsuario:", error);
      throw error;
    }
  }
};