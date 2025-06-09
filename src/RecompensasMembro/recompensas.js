// src/router/controllers/recompensas.js
import { PrismaClient } from '@prisma/client';
import { NIVEIS_RECOMPENSA, subtrairPontos } from '../services/pontosService.js';

const prisma = new PrismaClient();

/**
 * Retorna o progresso de pontos e nível do usuário logado.
 */
export const getProgressoUsuario = async (req, res) => {
  try {
    const usuarioid = req.usuario.usuarioid; // Assumindo que o ID do usuário está no req.usuario

    const usuario = await prisma.usuario.findUnique({
      where: { usuarioid },
      select: {
        pontos: true,
        nivelMembro: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const pontosAtuais = usuario.pontos;
    const nivelMembroAtual = usuario.nivelMembro;

    // Encontra as informações do nível atual
    const nivelAtualInfo = NIVEIS_RECOMPENSA.find(n => n.nivel === nivelMembroAtual);

    // Encontra as informações do próximo nível
    const proximoNivelInfo = NIVEIS_RECOMPENSA.find(n => n.nivel === nivelMembroAtual + 1);

    let pontosParaProximoNivel = 0;
    let percentualProgresso = 0;
    let proximoNivelTitulo = null;
    let nivelAtualDetalhes = null; // Objeto para o nível atual
    const beneficiosNivelAtual = nivelAtualInfo?.beneficios || [];

    if (nivelAtualInfo) {
      nivelAtualDetalhes = {
        nivel: nivelAtualInfo.nivel,
        titulo: nivelAtualInfo.titulo,
        minPontos: nivelAtualInfo.minPontos,
        maxPontos: nivelAtualInfo.maxPontos,
        beneficios: nivelAtualInfo.beneficios,
      };
    }

    if (proximoNivelInfo) {
      pontosParaProximoNivel = proximoNivelInfo.minPontos - pontosAtuais;

      // Calcula o progresso dentro do nível atual
      const pontosNoNivelAtual = pontosAtuais - (nivelAtualInfo?.minPontos || 0);
      const totalPontosNecessariosNoNivel = proximoNivelInfo.minPontos - (nivelAtualInfo?.minPontos || 0);

      if (totalPontosNecessariosNoNivel > 0) {
        percentualProgresso = (pontosNoNivelAtual / totalPontosNecessariosNoNivel) * 100;
      }

      proximoNivelTitulo = proximoNivelInfo.titulo;
    } else {
      // Se não há próximo nível, o usuário atingiu o nível máximo
      pontosParaProximoNivel = 0;
      percentualProgresso = 100; // Sempre 100% no nível máximo
      proximoNivelTitulo = 'Nível Máximo Atingido';
    }

    // Garante que o percentual esteja entre 0 e 100
    percentualProgresso = Math.min(100, Math.max(0, percentualProgresso));

    res.status(200).json({
      pontosAtuais: pontosAtuais,
      // Enviando o objeto completo do nível atual, facilitando o acesso no frontend
      nivelAtual: nivelAtualDetalhes,
      tituloNivelAtual: nivelAtualInfo?.titulo || 'Nível Desconhecido', // Mantido para compatibilidade
      proximoNivel: proximoNivelInfo ? {
        nivel: proximoNivelInfo.nivel,
        titulo: proximoNivelInfo.titulo,
        minPontos: proximoNivelInfo.minPontos,
        maxPontos: proximoNivelInfo.maxPontos,
        beneficios: proximoNivelInfo.beneficios,
      } : null, // Envia o objeto completo do próximo nível
      proximoNivelTitulo, // Mantido para compatibilidade
      pontosParaProximoNivel: Math.max(0, pontosParaProximoNivel), // Garante que não seja negativo
      percentualProgresso: parseFloat(percentualProgresso.toFixed(2)), // Duas casas decimais
      beneficiosNivelAtual, // Mantido para compatibilidade
      niveisDisponiveis: NIVEIS_RECOMPENSA.map(nivel => ({
        nivel: nivel.nivel,
        titulo: nivel.titulo,
        minPontos: nivel.minPontos,
        maxPontos: nivel.maxPontos,
        beneficios: nivel.beneficios,
      })),
    });
  } catch (error) {
    console.error('Erro ao obter progresso do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao obter progresso.' });
  }
};

/**
 * Retorna as recompensas disponíveis (desbloqueadas e bloqueadas) para o usuário logado.
 */
export const getRecompensasUsuario = async (req, res) => {
  try {
    const usuarioid = req.usuario.usuarioid;

    const usuario = await prisma.usuario.findUnique({
      where: { usuarioid },
      select: {
        pontos: true,
        nivelMembro: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Busca todas as recompensas ativas no banco de dados
    const todasRecompensas = await prisma.recompensa.findMany({
      where: {
        ativo: true,
      },
      orderBy: {
        pontos: 'asc', // Ordena por pontos para facilitar a exibição
      },
    });

    const unlockedRewards = [];
    const lockedRewards = [];

    // Classifica as recompensas com base nos pontos e nível do usuário
    for (const reward of todasRecompensas) {
      if (usuario.pontos >= reward.pontos && usuario.nivelMembro >= reward.nivelMinimo) {
        unlockedRewards.push(reward);
      } else {
        lockedRewards.push(reward);
      }
    }

    res.status(200).json({
      unlockedRewards,
      lockedRewards,
    });
  } catch (error) {
    console.error('Erro ao obter recompensas do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao obter recompensas.' });
  }
};

/**
 * Permite que um usuário resgate uma recompensa.
 */
export const redeemReward = async (req, res) => {
  try {
    const usuarioid = req.usuario.usuarioid;
    const { recompensaid } = req.params;

    // Converte recompensaid para BigInt se o seu Prisma Schema usar BigInt para IDs
    const recompensaIdBigInt = BigInt(recompensaid); 

    const recompensa = await prisma.recompensa.findUnique({
      where: { recompensaid: recompensaIdBigInt },
    });

    if (!recompensa || !recompensa.ativo) {
      return res.status(404).json({ message: 'Recompensa não encontrada ou inativa.' });
    }

    // Usa a função subtrairPontos do serviço para lidar com a lógica de pontos
    // e atualização de nível. Isso centraliza a lógica.
    const usuarioAtualizado = await subtrairPontos(usuarioid, recompensa.pontos);

    console.log(`[Recompensa] Usuário ID ${usuarioid} resgatou "${recompensa.titulo}" por ${recompensa.pontos} pontos.`);

    res.status(200).json({
      message: 'Recompensa resgatada com sucesso!',
      pontosAtuais: usuarioAtualizado.pontos,
    });
  } catch (error) {
    console.error('Erro ao resgatar recompensa:', error);
    // Erros específicos lançados por subtrairPontos (ex: Pontos insuficientes)
    if (error.message.includes('Pontos insuficientes')) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes('Usuário não encontrado')) {
        return res.status(404).json({ message: error.message });
    }
    // Para outros erros, retorna um erro interno do servidor
    res.status(500).json({ message: error.message || 'Erro interno ao resgatar recompensa.' });
  }
};
