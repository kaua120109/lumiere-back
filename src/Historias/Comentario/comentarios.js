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
      throw error;
    }
  }
};