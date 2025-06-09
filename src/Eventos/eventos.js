import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Adiciona logs para debug
  errorFormat: 'pretty'
});

// Fechar conexão ao terminar o processo
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Função para converter BigInt em string para JSON
const serializeBigInt = (obj) => {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};

// Teste de conexão com o banco
const testConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida com sucesso');
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco:', error);
    throw error;
  }
};

export const eventos = {
  async testarConexao() {
    return await testConnection();
  },

  async listarEventos() {
    try {
      console.log('🔍 Buscando eventos...');
      
      // Testa a conexão primeiro
      await prisma.$connect();
      
      const eventosEncontrados = await prisma.evento.findMany({
        orderBy: { data: 'asc' },
        select: {
          eventoid: true,
          nome: true,
          descricao: true,
          data: true,
          local: true,
          imagem: true,
          categoria: true
        }
      });

      console.log(`✅ ${eventosEncontrados.length} eventos encontrados`);
      
      // Serializa BigInt para evitar erros de JSON
      return serializeBigInt(eventosEncontrados);
      
    } catch (error) {
      console.error('❌ Erro ao listar eventos:', error);
      
      // Verifica se é erro de conexão
      if (error.code === 'P1001') {
        throw new Error('Não foi possível conectar ao banco de dados. Verifique se o banco está rodando.');
      }
      
      // Verifica se é erro de tabela não encontrada
      if (error.code === 'P2021') {
        throw new Error('Tabela "evento" não encontrada. Execute as migrations do Prisma.');
      }
      
      throw new Error(`Erro ao listar eventos: ${error.message}`);
    }
  },

  async buscarEventoPorId(eventId) {
    try {
      console.log(`🔍 Buscando evento ID: ${eventId}`);
      
      // Converte para BigInt se necessário
      const id = typeof eventId === 'string' ? BigInt(eventId) : eventId;
      
      const eventoEncontrado = await prisma.evento.findUnique({
        where: { eventoid: id },
        select: {
          eventoid: true,
          nome: true,
          descricao: true,
          data: true,
          local: true,
          imagem: true,
          categoria: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (eventoEncontrado) {
        console.log(`✅ Evento encontrado: ${eventoEncontrado.nome}`);
        return serializeBigInt(eventoEncontrado);
      }
      
      console.log(`❌ Evento não encontrado para ID: ${eventId}`);
      return null;
      
    } catch (error) {
      console.error(`❌ Erro ao buscar evento ${eventId}:`, error);
      throw new Error(`Erro ao buscar evento: ${error.message}`);
    }
  },

  async criarEvento(eventData) {
    try {
      console.log('➕ Criando novo evento:', eventData.nome);
      
      // Validação adicional
      if (!eventData.nome || !eventData.data || !eventData.local) {
        throw new Error('Dados incompletos: nome, data e local são obrigatórios');
      }

      // Validação de data
      const dataEvento = new Date(eventData.data);
      if (isNaN(dataEvento.getTime())) {
        throw new Error('Data inválida fornecida');
      }

      const novoEvento = await prisma.evento.create({
        data: {
          ...eventData,
          data: dataEvento
        }
      });

      console.log(`✅ Evento criado com sucesso: ${novoEvento.nome}`);
      return serializeBigInt(novoEvento);
      
    } catch (error) {
      console.error('❌ Erro ao criar evento:', error);
      
      // Verifica erros específicos do Prisma
      if (error.code === 'P2002') {
        throw new Error('Já existe um evento com esses dados únicos');
      }
      
      throw new Error(`Erro ao criar evento: ${error.message}`);
    }
  },

  async atualizarEvento(eventId, updateData) {
    try {
      console.log(`📝 Atualizando evento ID: ${eventId}`);
      
      const id = typeof eventId === 'string' ? BigInt(eventId) : eventId;
      
      // Prepara os dados para atualização
      const dadosAtualizacao = { ...updateData };
      if (updateData.data) {
        const dataEvento = new Date(updateData.data);
        if (isNaN(dataEvento.getTime())) {
          throw new Error('Data inválida fornecida para atualização');
        }
        dadosAtualizacao.data = dataEvento;
      }

      const eventoAtualizado = await prisma.evento.update({
        where: { eventoid: id },
        data: dadosAtualizacao
      });

      console.log(`✅ Evento atualizado: ${eventoAtualizado.nome}`);
      return serializeBigInt(eventoAtualizado);
      
    } catch (error) {
      console.error(`❌ Erro ao atualizar evento ${eventId}:`, error);
      
      if (error.code === 'P2025') {
        console.log(`❌ Evento não encontrado para ID: ${eventId}`);
        return null;
      }
      
      throw new Error(`Erro ao atualizar evento: ${error.message}`);
    }
  },

  async deletarEvento(eventId) {
    try {
      console.log(`🗑️ Deletando evento ID: ${eventId}`);
      
      const id = typeof eventId === 'string' ? BigInt(eventId) : eventId;
      
      const eventoDeletado = await prisma.evento.delete({
        where: { eventoid: id }
      });

      console.log(`✅ Evento deletado: ${eventoDeletado.nome}`);
      return serializeBigInt(eventoDeletado);
      
    } catch (error) {
      console.error(`❌ Erro ao deletar evento ${eventId}:`, error);
      
      if (error.code === 'P2025') {
        console.log(`❌ Evento não encontrado para ID: ${eventId}`);
        return null;
      }
      
      throw new Error(`Erro ao deletar evento: ${error.message}`);
    }
  }
};