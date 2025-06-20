// backend/src/services/conteudos.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TIPOS_CONTEUDO_VALIDOS = ['video', 'treino', 'dica', 'podcast', 'artigo'];

export class ConteudoService {
  /**
   * Cria um novo conteúdo no banco de dados.
   * @param {object} dados - Os dados do conteúdo a ser criado.
   * @returns {Promise<object>} O novo conteúdo criado.
   * @throws {Error} Se houver dados inválidos ou falha na criação.
   */
  static async criarConteudo(dados) {
    const { titulo, tipo, descricao, url, imagem, duracao, ativo = true } = dados;

    if (!titulo || !tipo || !url) {
      throw new Error("Título, tipo e URL são obrigatórios.");
    }
    if (!TIPOS_CONTEUDO_VALIDOS.includes(tipo.toLowerCase())) {
      throw new Error(`Tipo de conteúdo inválido. Tipos permitidos: ${TIPOS_CONTEUDO_VALIDOS.join(', ')}.`);
    }

    try {
      return await prisma.conteudo.create({
        data: {
          titulo,
          tipo: tipo.toLowerCase(),
          descricao,
          url,
          imagem,
          duracao,
          ativo, // Permite definir se o conteúdo está ativo ou não
        },
      });
    } catch (error) {
      console.error("Erro ao criar conteúdo:", error);
      throw new Error("Não foi possível criar o conteúdo.");
    }
  }

  /**
   * Lista todos os conteúdos, opcionalmente filtrando por tipo e status ativo.
   * @param {string} [tipo] - Tipo de conteúdo a ser filtrado.
   * @param {boolean} [apenasAtivos] - Se deve listar apenas conteúdos ativos.
   * @returns {Promise<object[]>} Lista de conteúdos.
   */
  static async listarConteudos(tipo, apenasAtivos) {
    const where = {};
    if (tipo) {
      if (!TIPOS_CONTEUDO_VALIDOS.includes(tipo.toLowerCase())) {
        throw new Error(`Tipo de conteúdo inválido para filtro. Tipos permitidos: ${TIPOS_CONTEUDO_VALIDOS.join(', ')}.`);
      }
      where.tipo = tipo.toLowerCase();
    }
    if (apenasAtivos !== undefined) {
      where.ativo = apenasAtivos;
    }

    try {
      return await prisma.conteudo.findMany({ where });
    } catch (error) {
      console.error("Erro ao listar conteúdos:", error);
      throw new Error("Não foi possível listar os conteúdos.");
    }
  }

  /**
   * Busca um conteúdo por ID.
   * @param {number} id - ID do conteúdo.
   * @returns {Promise<object>} O conteúdo encontrado.
   * @throws {Error} Se o conteúdo não for encontrado.
   */
  static async buscarConteudoPorId(id) {
    if (isNaN(id)) {
      throw new Error('ID do conteúdo inválido.');
    }
    try {
      const conteudo = await prisma.conteudo.findUnique({ where: { conteudoid: id } });
      if (!conteudo) {
        throw new Error('Conteúdo não encontrado.');
      }
      return conteudo;
    } catch (error) {
      console.error("Erro ao buscar conteúdo:", error);
      throw new Error("Não foi possível buscar o conteúdo.");
    }
  }

  /**
   * Atualiza um conteúdo existente.
   * @param {number} id - ID do conteúdo a ser atualizado.
   * @param {object} dados - Dados para atualização.
   * @returns {Promise<object>} O conteúdo atualizado.
   * @throws {Error} Se houver dados inválidos ou falha na atualização.
   */
  static async atualizarConteudo(id, dados) {
    const { titulo, tipo, descricao, url, imagem, duracao, ativo } = dados;

    if (isNaN(id)) {
      throw new Error('ID do conteúdo inválido.');
    }
    if (tipo && !TIPOS_CONTEUDO_VALIDOS.includes(tipo.toLowerCase())) {
      throw new Error(`Tipo de conteúdo inválido. Tipos permitidos: ${TIPOS_CONTEUDO_VALIDOS.join(', ')}.`);
    }

    try {
      return await prisma.conteudo.update({
        where: { conteudoid: id },
        data: {
          titulo,
          tipo: tipo ? tipo.toLowerCase() : undefined,
          descricao,
          url,
          imagem,
          duracao,
          ativo,
        },
      });
    } catch (error) {
      console.error("Erro ao atualizar conteúdo:", error);
      throw new Error("Não foi possível atualizar o conteúdo.");
    }
  }

  /**
   * Deleta um conteúdo.
   * @param {number} id - ID do conteúdo a ser deletado.
   * @returns {Promise<void>}
   * @throws {Error} Se o conteúdo não for encontrado ou falha na exclusão.
   */
  static async deletarConteudo(id) {
    if (isNaN(id)) {
      throw new Error('ID do conteúdo inválido.');
    }
    try {
      await prisma.conteudo.delete({ where: { conteudoid: id } });
    } catch (error) {
      console.error("Erro ao deletar conteúdo:", error);
      throw new Error("Não foi possível deletar o conteúdo.");
    }
  }

  /**
   * Registra ou atualiza a interação de um usuário com um conteúdo (visualização, favorito, progresso).
   * @param {number} usuarioid - ID do usuário.
   * @param {number} conteudoid - ID do conteúdo.
   * @param {boolean} [visualizado] - Status de visualização.
   * @param {number} [progresso] - Progresso de visualização (0-100).
   * @param {boolean} [favoritar] - Status de favorito (alterna se não especificado).
   * @returns {Promise<object>} A interação atualizada.
   */
  static async registrarInteracao(usuarioid, conteudoid, visualizado, progresso) {
    const uId = parseInt(usuarioid, 10);
    const cId = parseInt(conteudoid, 10);

    if (isNaN(uId) || isNaN(cId)) {
      throw new Error('IDs de usuário ou conteúdo inválidos.');
    }

    try {
      // Find the existing interaction to preserve favorite status if not explicitly passed
      const existingInteraction = await prisma.ConteudoUsuario.findUnique({
        where: {
          usuarioid_conteudoid: {
            usuarioid: uId,
            conteudoid: cId
          }
        },
        select: {
          favoritado: true
        }
      });

      return await prisma.ConteudoUsuario.upsert({
        where: {
          usuarioid_conteudoid: {
            usuarioid: uId,
            conteudoid: cId
          }
        },
        update: {
          visualizado: visualizado !== undefined ? visualizado : undefined,
          progresso: progresso !== undefined ? progresso : undefined,
          // favoritado will be handled by toggleFavorito, or kept as is
        },
        create: {
          usuarioid: uId,
          conteudoid: cId,
          visualizado: visualizado !== undefined ? visualizado : false,
          progresso: progresso !== undefined ? progresso : 0,
          favoritado: existingInteraction?.favoritado || false, // Keep existing favorite status or default to false
        },
        select: {
          visualizado: true,
          progresso: true,
          favoritado: true,
          assignadoEm: true,
        }
      });
    } catch (error) {
      console.error("Erro ao registrar interação de conteúdo:", error);
      throw new Error("Não foi possível registrar a interação com o conteúdo.");
    }
  }

  /**
   * Atualiza o progresso de um usuário em um conteúdo.
   * @param {number} usuarioid - ID do usuário.
   * @param {number} conteudoid - ID do conteúdo.
   * @param {number} progresso - Progresso em porcentagem (0-100).
   * @returns {Promise<object>} A interação atualizada.
   */
  static async atualizarProgresso(usuarioid, conteudoid, progresso) {
    const uId = parseInt(usuarioid, 10);
    const cId = parseInt(conteudoid, 10);
    const prog = parseInt(progresso, 10);

    if (isNaN(uId) || isNaN(cId)) {
      throw new Error('IDs de usuário ou conteúdo inválidos.');
    }
    if (isNaN(prog) || prog < 0 || prog > 100) {
      throw new Error('Progresso inválido. Deve ser um número entre 0 e 100.');
    }

    try {
      // Use upsert to create the entry if it doesn't exist, or update if it does
      return await prisma.ConteudoUsuario.upsert({
        where: {
          usuarioid_conteudoid: {
            usuarioid: uId,
            conteudoid: cId
          }
        },
        update: {
          progresso: prog,
          visualizado: prog === 100 ? true : undefined, // Mark as viewed if 100%
        },
        create: {
          usuarioid: uId,
          conteudoid: cId,
          progresso: prog,
          visualizado: prog === 100 ? true : false,
          favoritado: false, // Default to false if creating new
          // assignadoEm: new Date() // REMOVIDO: Prisma já cuida disso com @default(now())
        },
        select: {
          progresso: true,
          visualizado: true,
          favoritado: true,
          assignadoEm: true
        }
      });
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error);
      throw new Error("Não foi possível atualizar o progresso do conteúdo.");
    }
  }

  /**
   * Alterna o status de favorito de um conteúdo para um usuário.
   * Se 'favoritar' for fornecido, define para esse valor. Caso contrário, inverte o status atual.
   * @param {number} usuarioid - ID do usuário.
   * @param {number} conteudoid - ID do conteúdo.
   * @param {boolean} [favoritar] - Opcional. Se true, marca como favorito; se false, desmarca. Se não definido, alterna.
   * @returns {Promise<object>} A interação atualizada.
   */
  static async toggleFavorito(usuarioid, conteudoid, favoritar) {
    const uId = parseInt(usuarioid, 10);
    const cId = parseInt(conteudoid, 10);

    if (isNaN(uId) || isNaN(cId)) {
      throw new Error('IDs de usuário ou conteúdo inválidos.');
    }

    try {
      const interacaoExistente = await prisma.ConteudoUsuario.findUnique({
        where: {
          usuarioid_conteudoid: {
            usuarioid: uId,
            conteudoid: cId
          }
        },
        select: {
          favoritado: true
        }
      });

      const novoStatusFavorito = favoritar !== undefined
        ? favoritar
        : !interacaoExistente?.favoritado; // Alterna se não foi definido

      return await prisma.ConteudoUsuario.upsert({
        where: {
          usuarioid_conteudoid: {
            usuarioid: uId,
            conteudoid: cId
          }
        },
        update: {
          favoritado: novoStatusFavorito,
          // Não alteramos visualizado/progresso aqui, apenas o favorito
        },
        create: {
          usuarioid: uId,
          conteudoid: cId,
          favoritado: novoStatusFavorito,
          visualizado: false, // Default ao criar
          progresso: 0,       // Default ao criar
        },
        select: {
          favoritado: true,
          visualizado: true,
          progresso: true,
          assignadoEm: true
        }
      });
    } catch (error) {
      console.error("Erro ao alternar favorito:", error);
      throw new Error("Não foi possível atualizar o status de favorito.");
    }
  }

  /**
   * Lista os conteúdos favoritados por um usuário.
   * @param {number} usuarioid - ID do usuário.
   * @returns {Promise<object[]>} Lista de conteúdos favoritados.
   */
  static async listarConteudosFavoritados(usuarioid) {
    const uId = parseInt(usuarioid, 10);
    if (isNaN(uId)) {
      throw new Error('ID de usuário inválido.');
    }

    try {
      return await prisma.ConteudoUsuario.findMany({
        where: {
          usuarioid: uId,
          favoritado: true
        },
        include: {
          conteudo: true // Inclui os detalhes completos do conteúdo
        }
      });
    } catch (error) {
      console.error("Erro ao listar conteúdos favoritados:", error);
      throw new Error("Não foi possível listar os conteúdos favoritados.");
    }
  }

  /**
   * Lista os conteúdos visualizados por um usuário.
   * @param {number} usuarioid - ID do usuário.
   * @returns {Promise<object[]>} Lista de conteúdos visualizados.
   */
  static async listarConteudosVisualizados(usuarioid) {
    const uId = parseInt(usuarioid, 10);
    if (isNaN(uId)) {
      throw new Error('ID de usuário inválido.');
    }

    try {
      return await prisma.ConteudoUsuario.findMany({
        where: {
          usuarioid: uId,
          visualizado: true
        },
        include: {
          conteudo: true // Inclui os detalhes completos do conteúdo
        }
      });
    } catch (error) {
      console.error("Erro ao listar conteúdos visualizados:", error);
      throw new Error("Não foi possível listar os conteúdos visualizados.");
    }
  }

  /**
   * Busca as interações de um usuário com um conteúdo específico.
   * @param {number} usuarioid - ID do usuário.
   * @param {number} conteudoid - ID do conteúdo.
   * @returns {Promise<object | null>} A interação ou null se não existir.
   */
  static async buscarInteracaoPorUsuarioEConteudo(usuarioid, conteudoid) {
    const uId = parseInt(usuarioid, 10);
    const cId = parseInt(conteudoid, 10);

    if (isNaN(uId) || isNaN(cId)) {
      throw new Error('IDs de usuário ou conteúdo inválidos.');
    }

    try {
      return await prisma.ConteudoUsuario.findUnique({
        where: {
          usuarioid_conteudoid: {
            usuarioid: uId,
            conteudoid: cId
          }
        },
        select: {
          visualizado: true,
          favoritado: true,
          progresso: true,
          assignadoEm: true
        }
      });
    } catch (error) {
      console.error("Erro ao buscar interação de usuário com conteúdo:", error);
      throw new Error("Não foi possível buscar a interação.");
    }
  }
}