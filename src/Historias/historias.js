import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const historias = {
  async listaHistorias() {
    try {
      const result = await prisma.historia.findMany({
        include: {
          usuario: {
            select: { nome: true, usuario: true },
          },
          _count: {
            select: { comentarios: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return result;
    } catch (error) {
      ("Erro em listaHistorias:", error);
      throw error;
    }
  },

  async criarHistoria(dados) {
    try {
      const result = await prisma.historia.create({
        data: {
          titulo: dados.titulo,
          conteudo: dados.conteudo,
          imagem: dados.imagem || null,
          categoria: dados.categoria || null,
          esporte: dados.esporte || null,
          // Conectar ao usuário existente usando o ID
          usuario: {
            connect: { usuarioid: dados.usuarioId }
          }
        },
      });
      return result;
    } catch (error) {
      throw error;
    }
  },

  async buscarHistoriaPorId(id) {
    try {
      const result = await prisma.historia.findUnique({
        where: { historiaId: BigInt(id) },
        include: {
          usuario: {
            select: { nome: true, usuario: true },
          },
          comentarios: {
            include: {
              usuario: {
                select: { nome: true, usuario: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      return result;
    } catch (error) {
      ("Erro em buscarHistoriaPorId:", error);
      throw error;
    }
  },

  async atualizarHistoria(id, dados) {
    try {
      const result = await prisma.historia.update({
        where: { historiaId: BigInt(id) },
        data: {
          titulo: dados.titulo,
          conteudo: dados.conteudo,
          imagem: dados.imagem || null,
          categoria: dados.categoria || null,
          esporte: dados.esporte || null,
        },
      });
      return result;
    } catch (error) {
      ("Erro em atualizarHistoria:", error);
      throw error;
    }
  },

  async deletarHistoria(id) {
    try {
      // Primeiro excluir todos os comentários relacionados
      await prisma.comentario.deleteMany({
        where: { historiaId: BigInt(id) }
      });

      // Depois excluir a história
      const result = await prisma.historia.delete({
        where: { historiaId: BigInt(id) }
      });
      return result;
    } catch (error) {
      throw error;
    }
  },

  async listaHistoriasPorUsuario(usuarioId) {
    try {
      const result = await prisma.historia.findMany({
        where: { usuarioId: parseInt(usuarioId) },
        include: {
          usuario: {
            select: { nome: true, usuario: true },
          },
          _count: {
            select: { comentarios: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return result;
    } catch (error) {
      throw error;
    }
  },
};

// Funções para comentários
export const comentarios = {
  async listarComentarios(historiaId) {
    try {
      const result = await prisma.comentario.findMany({
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
      return result;
    } catch (error) {
      ("Erro em listarComentarios:", error);
      throw error;
    }
  },

  async criarComentario(dados) {
    try {
      const result = await prisma.comentario.create({
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
      return result;
    } catch (error) {
      ("Erro em criarComentario:", error);
      throw error;
    }
  },

  async excluirComentario(comentarioId) {
    try {
      const result = await prisma.comentario.delete({
        where: {
          comentarioId: BigInt(comentarioId)
        }
      });
      return result;
    } catch (error) {
      ("Erro em excluirComentario:", error);
      throw error;
    }
  },

  async listarComentariosPorUsuario(usuarioId) {
    try {
      const result = await prisma.comentario.findMany({
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
      return result;
    } catch (error) {
      throw error;
    }
  }
};