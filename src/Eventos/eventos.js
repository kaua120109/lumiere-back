import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const eventos = {
  /**
   * Lista todos os eventos disponíveis.
   * Os eventos são ordenados pela data em ordem crescente.
   * @returns {Promise<Array>} Uma promessa que resolve para um array de objetos de evento.
   * @throws {Error} Se ocorrer um erro ao listar os eventos.
   */
  async listarEventos() {
    try {
      const allEvents = await prisma.evento.findMany({
        orderBy: {
          data: 'asc', // Ordenar eventos pela data em ordem crescente
        },
      });
      return allEvents;
    } catch (error) {
      console.error("Erro ao listar eventos:", error);
      throw new Error("Não foi possível listar os eventos. Tente novamente mais tarde.");
    } finally {
      await prisma.$disconnect();
    }
  },

  /**
   * Busca um evento específico pelo seu ID.
   * @param {BigInt} eventId - O ID único do evento a ser buscado.
   * @returns {Promise<Object|null>} Uma promessa que resolve para o objeto do evento se encontrado, ou null.
   * @throws {Error} Se ocorrer um erro ao buscar o evento.
   */
  async buscarEventoPorId(eventId) {
    try {
      const event = await prisma.evento.findUnique({
        where: {
          eventoid: eventId,
        },
      });
      return event;
    } catch (error) {
      console.error(`Erro ao buscar evento com ID ${eventId}:`, error);
      throw new Error(`Não foi possível encontrar o evento com ID ${eventId}.`);
    } finally {
      await prisma.$disconnect();
    }
  },

  /**
   * Cria um novo evento.
   * @param {Object} eventData - Os dados para o novo evento.
   * @param {string} eventData.titulo - O título do evento.
   * @param {string} eventData.descricao - A descrição detalhada do evento.
   * @param {Date} eventData.data - A data e hora do evento.
   * @param {string} eventData.local - O local onde o evento será realizado.
   * @param {string} [eventData.imagem] - Opcional, a URL da imagem do evento.
   * @returns {Promise<Object>} Uma promessa que resolve para o objeto do evento recém-criado.
   * @throws {Error} Se ocorrer um erro ao criar o evento.
   */
  async criarEvento(eventData) {
    try {
      const newEvent = await prisma.evento.create({
        data: eventData,
      });
      return newEvent;
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      throw new Error("Não foi possível criar o evento. Verifique os dados e tente novamente.");
    } finally {
      await prisma.$disconnect();
    }
  },

  /**
   * Atualiza um evento existente.
   * @param {BigInt} eventId - O ID do evento a ser atualizado.
   * @param {Object} updateData - Os dados para atualização do evento.
   * @param {string} [updateData.titulo] - O novo título do evento.
   * @param {string} [updateData.descricao] - A nova descrição do evento.
   * @param {Date} [updateData.data] - A nova data e hora do evento.
   * @param {string} [updateData.local] - O novo local do evento.
   * @param {string} [updateData.imagem] - A nova URL da imagem do evento.
   * @returns {Promise<Object>} Uma promessa que resolve para o objeto do evento atualizado.
   * @throws {Error} Se ocorrer um erro ao atualizar o evento.
   */
  async atualizarEvento(eventId, updateData) {
    try {
      const updatedEvent = await prisma.evento.update({
        where: {
          eventoid: eventId,
        },
        data: updateData,
      });
      return updatedEvent;
    } catch (error) {
      console.error(`Erro ao atualizar evento com ID ${eventId}:`, error);
      throw new Error(`Não foi possível atualizar o evento com ID ${eventId}.`);
    } finally {
      await prisma.$disconnect();
    }
  },

  /**
   * Deleta um evento pelo seu ID.
   * @param {BigInt} eventId - O ID do evento a ser deletado.
   * @returns {Promise<Object>} Uma promessa que resolve para o objeto do evento deletado.
   * @throws {Error} Se ocorrer um erro ao deletar o evento.
   */
  async deletarEvento(eventId) {
    try {
      const deletedEvent = await prisma.evento.delete({
        where: {
          eventoid: eventId,
        },
      });
      return deletedEvent;
    } catch (error) {
      console.error(`Erro ao deletar evento com ID ${eventId}:`, error);
      throw new Error(`Não foi possível deletar o evento com ID ${eventId}. Verifique se ele existe.`);
    } finally {
      await prisma.$disconnect();
    }
  },
};