// backend/src/Eventos/eventos.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função auxiliar para serializar BigInt para JSON
// Necessário porque BigInt não é nativamente suportado por JSON.stringify
function serializeBigInt(obj) {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint'
      ? value.toString()
      : value // Retorna a data no formato ISO para consistência
  ));
}

export const eventos = {
  // Testar conexão com o banco de dados
  async testarConexao() {
    try {
      await prisma.$connect();
      console.log('✨ Conexão com o banco de dados estabelecida com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao conectar ao banco de dados:', error);
      return false;
    } finally {
      await prisma.$disconnect();
    }
  },

  // Listar todos os eventos
  async listarEventos() {
    try {
      console.log('🔍 Buscando eventos...');
      const todosEventos = await prisma.evento.findMany();
      console.log(`✅ ${todosEventos.length} eventos encontrados.`);
      return serializeBigInt(todosEventos);
    } catch (error) {
      console.error('❌ Erro ao listar eventos:', error);
      throw new Error('Erro ao buscar eventos.');
    }
  },

  // Buscar evento por ID
  async buscarEventoPorId(id) {
    try {
      const eventoid = typeof id === 'string' ? BigInt(id) : id;
      console.log(`🔍 Buscando evento ID: ${eventoid}...`);
      const evento = await prisma.evento.findUnique({
        where: { eventoid },
      });
      if (!evento) {
        console.log(`❕ Evento ID: ${eventoid} não encontrado.`);
        return null;
      }
      console.log(`✅ Evento ID: ${eventoid} encontrado: ${evento.nome}`);
      return serializeBigInt(evento);
    } catch (error) {
      console.error(`❌ Erro ao buscar evento ID ${id}:`, error);
      throw new Error('Erro ao buscar evento por ID.');
    }
  },

  // Criar um novo evento
  async criarEvento(dadosEvento) {
    try {
      console.log('✨ Tentando criar novo evento...');

      // Preparar dados para criação, tratando strings vazias para null e convertendo tipos
      const dadosParaCriar = {
        nome: dadosEvento.nome,
        descricao: dadosEvento.descricao === '' ? null : dadosEvento.descricao,
        local: dadosEvento.local,
        imagem: dadosEvento.imagem === '' ? null : dadosEvento.imagem,
        categoria: dadosEvento.categoria === '' ? null : dadosEvento.categoria,
      };

      // Validação e conversão da data
      if (dadosEvento.data) {
        const dataEvento = new Date(dadosEvento.data);
        if (isNaN(dataEvento.getTime())) {
          throw new Error('Data do evento inválida. Formato esperado: AAAA-MM-DDTHH:MM ou formato de data ISO.');
        }
        dadosParaCriar.data = dataEvento;
      } else {
        throw new Error('Data do evento é obrigatória.'); // Data é obrigatória no seu schema
      }

      // Conversão de números com validação
      if (dadosEvento.km !== undefined && dadosEvento.km !== null && dadosEvento.km !== '') {
        const kmValue = parseFloat(dadosEvento.km);
        if (isNaN(kmValue) || kmValue < 0) {
          throw new Error('Distância em Km deve ser um número positivo.');
        }
        dadosParaCriar.km = kmValue;
      } else {
        dadosParaCriar.km = null;
      }

      if (dadosEvento.capacidadeMaxima !== undefined && dadosEvento.capacidadeMaxima !== null && dadosEvento.capacidadeMaxima !== '') {
        const capacidadeValue = parseInt(dadosEvento.capacidadeMaxima, 10);
        if (isNaN(capacidadeValue) || capacidadeValue < 0) {
          throw new Error('Capacidade Máxima deve ser um número inteiro positivo.');
        }
        dadosParaCriar.capacidadeMaxima = capacidadeValue;
      } else {
        dadosParaCriar.capacidadeMaxima = null;
      }

      if (dadosEvento.ingressosDisponiveis !== undefined && dadosEvento.ingressosDisponiveis !== null && dadosEvento.ingressosDisponiveis !== '') {
        const ingressosValue = parseInt(dadosEvento.ingressosDisponiveis, 10);
        if (isNaN(ingressosValue) || ingressosValue < 0) {
          throw new Error('Ingressos Disponíveis deve ser um número inteiro positivo.');
        }
        dadosParaCriar.ingressosDisponiveis = ingressosValue;
      } else {
        dadosParaCriar.ingressosDisponiveis = null;
      }

      if (dadosEvento.preco !== undefined && dadosEvento.preco !== null && dadosEvento.preco !== '') {
        const precoValue = parseFloat(dadosEvento.preco);
        if (isNaN(precoValue) || precoValue < 0) {
          throw new Error('Preço deve ser um número positivo.');
        }
        dadosParaCriar.preco = precoValue;
      } else {
        dadosParaCriar.preco = null;
      }

      console.log('Dados finais para criação no Prisma:', dadosParaCriar);

      const novoEvento = await prisma.evento.create({
        data: dadosParaCriar,
      });
      console.log(`✅ Evento criado: ${novoEvento.nome}`);
      return serializeBigInt(novoEvento);
    } catch (error) {
      console.error('❌ Erro ao criar evento:', error.message);
      // Erro P2000: The provided value for the column is too long for the column's type.
      if (error.code === 'P2000') {
        throw new Error(`O valor fornecido é muito longo para uma das colunas. Verifique o tamanho de 'imagem' ou 'descrição'. Erro: ${error.meta?.column_name || 'coluna não especificada'}`);
      }
      // Erro P2002: Unique constraint failed on the {constraint}
      if (error.code === 'P2002') {
        throw new Error(`Já existe um evento com o(s) dado(s) ${error.meta.target.join(', ')} fornecido(s).`);
      }
      throw new Error(`Erro ao criar evento: ${error.message}`);
    }
  },

  // Atualizar um evento existente
  async atualizarEvento(eventId, dadosAtualizacao) {
    try {
      console.log(`📝 Tentando atualizar evento ID: ${eventId} com dados recebidos:`, dadosAtualizacao);
      const id = typeof eventId === 'string' ? BigInt(eventId) : eventId;

      const dataToUpdate = {};

      // TRATAMENTO DA DATA: Garante que a data é um objeto Date válido se for fornecida
      // Permite que 'data' seja atualizada para null se for explicitamente enviada como '' ou null
      if (Object.prototype.hasOwnProperty.call(dadosAtualizacao, 'data')) {
        if (dadosAtualizacao.data === '' || dadosAtualizacao.data === null) {
          dataToUpdate.data = null; // Se permitido pelo schema.prisma
        } else {
          const dataEvento = new Date(dadosAtualizacao.data);
          if (isNaN(dataEvento.getTime())) {
            throw new Error('Data do evento inválida. Formato esperado: AAAA-MM-DDTHH:MM ou formato de data ISO.');
          }
          dataToUpdate.data = dataEvento;
        }
      }

      // TRATAMENTO DOS CAMPOS GERAIS (String)
      // Usamos Object.prototype.hasOwnProperty.call para verificar se a propriedade existe
      // e tratamos strings vazias como null para campos opcionais no DB.
      if (Object.prototype.hasOwnProperty.call(dadosAtualizacao, 'nome')) {
        dataToUpdate.nome = dadosAtualizacao.nome;
      }
      if (Object.prototype.hasOwnProperty.call(dadosAtualizacao, 'descricao')) {
        dataToUpdate.descricao = dadosAtualizacao.descricao === '' ? null : dadosAtualizacao.descricao;
      }
      if (Object.prototype.hasOwnProperty.call(dadosAtualizacao, 'local')) {
        dataToUpdate.local = dadosAtualizacao.local;
      }
      if (Object.prototype.hasOwnProperty.call(dadosAtualizacao, 'imagem')) {
        dataToUpdate.imagem = dadosAtualizacao.imagem === '' ? null : dadosAtualizacao.imagem;
      }
      // TRATAMENTO ESPECÍFICO DA CATEGORIA
      if (Object.prototype.hasOwnProperty.call(dadosAtualizacao, 'categoria')) {
        dataToUpdate.categoria = (dadosAtualizacao.categoria === '' || dadosAtualizacao.categoria === null)
          ? null
          : String(dadosAtualizacao.categoria); // Garante que seja uma string
      }

      // TRATAMENTO DOS CAMPOS NUMÉRICOS (Float/Int)
      // Convertemos para null se for string vazia ou null, caso contrário parseamos.
      // E validamos se o resultado da parseamento é um número válido.
      if (Object.prototype.hasOwnProperty.call(dadosAtualizacao, 'km')) {
        dataToUpdate.km = (dadosAtualizacao.km === '' || dadosAtualizacao.km === null) ? null : parseFloat(dadosAtualizacao.km);
        if (isNaN(dataToUpdate.km) && dataToUpdate.km !== null) {
          throw new Error('Distância em Km deve ser um número válido.');
        }
      }
      if (Object.prototype.hasOwnProperty.call(dadosAtualizacao, 'capacidadeMaxima')) {
        dataToUpdate.capacidadeMaxima = (dadosAtualizacao.capacidadeMaxima === '' || dadosAtualizacao.capacidadeMaxima === null) ? null : parseInt(dadosAtualizacao.capacidadeMaxima, 10);
        if (isNaN(dataToUpdate.capacidadeMaxima) && dataToUpdate.capacidadeMaxima !== null) {
          throw new Error('Capacidade Máxima deve ser um número inteiro válido.');
        }
      }
      if (Object.prototype.hasOwnProperty.call(dadosAtualizacao, 'ingressosDisponiveis')) {
        dataToUpdate.ingressosDisponiveis = (dadosAtualizacao.ingressosDisponiveis === '' || dadosAtualizacao.ingressosDisponiveis === null) ? null : parseInt(dadosAtualizacao.ingressosDisponiveis, 10);
        if (isNaN(dataToUpdate.ingressosDisponiveis) && dataToUpdate.ingressosDisponiveis !== null) {
          throw new Error('Ingressos Disponíveis deve ser um número inteiro válido.');
        }
      }
      if (Object.prototype.hasOwnProperty.call(dadosAtualizacao, 'preco')) {
        dataToUpdate.preco = (dadosAtualizacao.preco === '' || dadosAtualizacao.preco === null) ? null : parseFloat(dadosAtualizacao.preco);
        if (isNaN(dataToUpdate.preco) && dataToUpdate.preco !== null) {
          throw new Error('Preço deve ser um número válido.');
        }
      }

      console.log('Dados finais a serem atualizados no Prisma:', dataToUpdate);

      const eventoAtualizado = await prisma.evento.update({
        where: { eventoid: id },
        data: dataToUpdate
      });

      console.log(`✅ Evento atualizado com sucesso: ${eventoAtualizado.nome}`);
      return serializeBigInt(eventoAtualizado);

    } catch (error) {
      console.error(`❌ Erro ao atualizar evento ID ${eventId}:`, error.message);
      // Erros específicos do Prisma
      if (error.code === 'P2025') {
        throw new Error(`Evento com ID ${eventId} não encontrado para atualização.`);
      }
      if (error.code === 'P2002') {
        throw new Error(`Erro ao atualizar evento: Já existe outro evento com o(s) mesmo(s) ${error.meta.target.join(', ')}.`);
      }
      // Re-lança o erro original ou uma mensagem mais genérica
      throw new Error(`Erro ao atualizar evento: ${error.message}`);
    }
  },

  // Deletar um evento
  async deletarEvento(id) {
    try {
      const eventoid = typeof id === 'string' ? BigInt(id) : id;
      console.log(`🔥 Tentando deletar evento ID: ${eventoid}...`);
      const eventoDeletado = await prisma.evento.delete({
        where: { eventoid },
      });
      console.log(`✅ Evento ID: ${eventoid} deletado com sucesso: ${eventoDeletado.nome}`);
      return serializeBigInt(eventoDeletado);
    } catch (error) {
      console.error(`❌ Erro ao deletar evento ID ${id}:`, error.message);
      if (error.code === 'P2025') {
        throw new Error(`Evento com ID ${id} não encontrado para deleção.`);
      }
      throw new Error(`Erro ao deletar evento: ${error.message}`);
    }
  },
};