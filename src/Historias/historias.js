import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const historias = {
  async listaHistorias() {
    console.log("Iniciando listaHistorias");
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
      console.log("Consulta bem-sucedida:", result.length, "histórias encontradas");
      return result;
    } catch (error) {
      console.error("Erro em listaHistorias:", error);
      throw error;
    }
  },

  async criarHistoria(dados) {
    console.log("Iniciando criarHistoria com dados:", dados);
    try {
      const result = await prisma.historia.create({
        data: {
          titulo: dados.titulo,
          conteudo: dados.conteudo,
          imagem: dados.imagem || null,
          usuarioId: dados.usuarioId,
          categoria: dados.categoria || null,
          esporte: dados.esporte || null,
        },
      });
      console.log("História criada com sucesso:", result);
      return result;
    } catch (error) {
      console.error("Erro em criarHistoria:", error);
      throw error;
    }
  },

  async buscarHistoriaPorId(id) {
    console.log("Iniciando buscarHistoriaPorId para id:", id);
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
      console.log("Consulta bem-sucedida:", result ? "História encontrada" : "História não encontrada");
      return result;
    } catch (error) {
      console.error("Erro em buscarHistoriaPorId:", error);
      throw error;
    }
  },

  async atualizarHistoria(id, dados) {
    console.log("Iniciando atualizarHistoria para id:", id, "com dados:", dados);
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
      console.log("História atualizada com sucesso:", result);
      return result;
    } catch (error) {
      console.error("Erro em atualizarHistoria:", error);
      throw error;
    }
  },

  async deletarHistoria(id) {
    console.log("Iniciando deletarHistoria para id:", id);
    try {
      // Primeiro excluir todos os comentários relacionados
      await prisma.comentario.deleteMany({
        where: { historiaId: BigInt(id) }
      });
      console.log("Comentários excluídos com sucesso");

      // Depois excluir a história
      const result = await prisma.historia.delete({
        where: { historiaId: BigInt(id) }
      });
      console.log("História excluída com sucesso:", result);
      return result;
    } catch (error) {
      console.error("Erro em deletarHistoria:", error);
      throw error;
    }
  },

  async listaHistoriasPorUsuario(usuarioId) {
    console.log("Iniciando listaHistoriasPorUsuario para usuarioId:", usuarioId);
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
      console.log("Consulta bem-sucedida:", result.length, "histórias encontradas");
      return result;
    } catch (error) {
      console.error("Erro em listaHistoriasPorUsuario:", error);
      throw error;
    }
  },
};

// Funções para comentários
export const comentarios = {
  async listarComentarios(historiaId) {
    console.log("Iniciando listarComentarios para historiaId:", historiaId);
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
      console.log("Consulta bem-sucedida:", result.length, "comentários encontrados");
      return result;
    } catch (error) {
      console.error("Erro em listarComentarios:", error);
      throw error;
    }
  },

  async criarComentario(dados) {
    console.log("Iniciando criarComentario com dados:", dados);
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
      console.log("Comentário criado com sucesso:", result);
      return result;
    } catch (error) {
      console.error("Erro em criarComentario:", error);
      throw error;
    }
  },

  async excluirComentario(comentarioId) {
    console.log("Iniciando excluirComentario para comentarioId:", comentarioId);
    try {
      const result = await prisma.comentario.delete({
        where: {
          comentarioId: BigInt(comentarioId)
        }
      });
      console.log("Comentário excluído com sucesso:", result);
      return result;
    } catch (error) {
      console.error("Erro em excluirComentario:", error);
      throw error;
    }
  },

  async listarComentariosPorUsuario(usuarioId) {
    console.log("Iniciando listarComentariosPorUsuario para usuarioId:", usuarioId);
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
      console.log("Consulta bem-sucedida:", result.length, "comentários encontrados");
      return result;
    } catch (error) {
      console.error("Erro em listarComentariosPorUsuario:", error);
      throw error;
    }
  }
};