// eventos.js
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

      const eventosEncontrados = await prisma.evento.findMany({
        orderBy: { data: 'asc' },
        select: {
          eventoid: true,
          nome: true,
          data: true,
          local: true,
          descricao: true,
          imagem: true,    // Adicionei imagem, categoria e km de volta, pois parecem úteis
          categoria: true,
          km: true,
          // REMOVIDOS os campos que não existiam no schema.prisma:
          // capacidadeMaxima: true,
          // ingressosDisponiveis: true,
          // preco: true,
        }
      });

      console.log(`✅ Encontrados ${eventosEncontrados.length} eventos.`);
      return serializeBigInt(eventosEncontrados);

    } catch (error) {
      console.error('❌ Erro ao buscar eventos:', error);
      throw new Error(`Erro ao listar eventos: ${error.message}`);
    }
  },

  async buscarEventoPorId(eventId) {
    try {
      console.log(`🔍 Buscando evento ID: ${eventId}`);

      const id = typeof eventId === 'string' ? BigInt(eventId) : eventId;

      const eventoEncontrado = await prisma.evento.findUnique({
        where: { eventoid: id },
        select: {
          eventoid: true,
          nome: true,
          data: true,
          local: true,
          descricao: true,
          imagem: true,    // Adicionei imagem, categoria e km de volta
          categoria: true,
          km: true,
          // REMOVIDOS os campos que não existiam no schema.prisma:
          // capacidadeMaxima: true,
          // ingressosDisponiveis: true,
          // preco: true,
        }
      });

      if (!eventoEncontrado) {
        console.log(`🔍 Evento ID: ${eventId} não encontrado.`);
        return null;
      }

      console.log(`✅ Evento encontrado: ${eventoEncontrado.nome}`);
      return serializeBigInt(eventoEncontrado);

    } catch (error) {
      console.error(`❌ Erro ao buscar evento ID ${eventId}:`, error);
      throw new Error(`Erro ao buscar evento por ID: ${error.message}`);
    }
  },

  async criarEvento(dadosEvento) {
    try {
      console.log('✨ Tentando criar novo evento...');

      let dataEvento = new Date(dadosEvento.data);
      if (isNaN(dataEvento.getTime())) {
        throw new Error('Data do evento inválida. Formato esperado: AAAA-MM-DD ou formato de data ISO.');
      }

      // Garante que o preço seja um número de ponto flutuante, se aplicável
      // Este tratamento foi mantido, mas se 'preco' não for adicionado ao schema,
      // ele não será salvo no DB.
      if (dadosEvento.preco !== undefined) {
        dadosEvento.preco = parseFloat(dadosEvento.preco);
      }

      const novoEvento = await prisma.evento.create({
        data: {
          nome: dadosEvento.nome,
          data: dataEvento,
          local: dadosEvento.local,
          descricao: dadosEvento.descricao || null,
          imagem: dadosEvento.imagem || null,     // Adicionei tratamento para imagem
          categoria: dadosEvento.categoria || null, // Adicionei tratamento para categoria
          km: dadosEvento.km || null,             // Adicionei tratamento para km
          // Note: capacidadeMaxima, ingressosDisponiveis e preco não estão aqui,
          // a menos que você os tenha adicionado ao schema.prisma
          // capacidadeMaxima: dadosEvento.capacidadeMaxima || 0,
          // ingressosDisponiveis: dadosEvento.ingressosDisponiveis || 0,
          // preco: dadosEvento.preco || 0.0,
        }
      });

      console.log(`✅ Evento criado com sucesso: ${novoEvento.nome}`);
      return serializeBigInt(novoEvento);

    } catch (error) {
      console.error('❌ Erro ao criar evento:', error);
      if (error.code === 'P2002') {
        throw new Error(`Erro ao criar evento: Já existe um evento com o mesmo ${error.meta.target.join(', ')}.`);
      }
      throw new Error(`Erro ao criar evento: ${error.message}`);
    }
  },

  async atualizarEvento(eventId, dadosAtualizacao) {
    try {
      console.log(`📝 Atualizando evento ID: ${eventId}`);

      const id = typeof eventId === 'string' ? BigInt(eventId) : eventId;

      // Validação e conversão da data se presente
      if (dadosAtualizacao.data) {
        const dataEvento = new Date(dadosAtualizacao.data);
        if (isNaN(dataEvento.getTime())) {
          throw new Error('Data inválida fornecida para atualização');
        }
        dadosAtualizacao.data = dataEvento;
      }

      // Garante que o preço seja um número de ponto flutuante, se aplicável
      if (dadosAtualizacao.preco !== undefined) {
        dadosAtualizacao.preco = parseFloat(dadosAtualizacao.preco);
      }

      const eventoAtualizado = await prisma.evento.update({
        where: { eventoid: id },
        data: dadosAtualizacao // Prisma é inteligente o suficiente para aplicar apenas os campos existentes
      });

      console.log(`✅ Evento atualizado: ${eventoAtualizado.nome}`);
      return serializeBigInt(eventoAtualizado);

    } catch (error) {
      console.error(`❌ Erro ao atualizar evento ${eventId}:`, error);

      if (error.code === 'P2025') {
        console.log(`❌ Evento não encontrado para ID: ${eventId}`);
        return null;
      }

      if (error.code === 'P2002') {
        throw new Error(`Erro ao atualizar evento: Já existe outro evento com o(s) mesmo(s) ${error.meta.target.join(', ')}.`);
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
      console.error(`❌ Erro ao deletar evento ID ${eventId}:`, error);

      if (error.code === 'P2025') {
        console.log(`❌ Evento não encontrado para ID: ${eventId}`);
        return null;
      }

      throw new Error(`Erro ao deletar evento: ${error.message}`);
    }
  }
};