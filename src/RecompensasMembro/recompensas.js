// src/router/controllers/recompensas.js
import { PrismaClient } from '@prisma/client';
import { adicionarPontos } from '../service/pontosService.js' // Importa os níveis do serviço de pontos

const prisma = new PrismaClient();

/**
 * Retorna o progresso de pontos e nível do usuário logado.
 */
export const getProgressoUsuario = async (req, res) => {
  try {
    const usuarioid = req.usuario.usuarioid; // ID do usuário do token de autenticação

    const usuario = await prisma.usuario.findUnique({
      where: { usuarioid: usuarioid },
      select: {
        pontos: true,
        nivelMembro: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const pontos = usuario.pontos;
    const nivelMembro = usuario.nivelMembro;

    const nivelAtualInfo = adicionarPontos.find(n => n.nivel === nivelMembro);
    const proximoNivelInfo = adicionarPontos.find(n => n.nivel === nivelMembro + 1);

    let pontosParaProximoNivel = 0;
    let percentualProgresso = 0;
    let proximoNivelTitulo = null;
    let beneficiosNivelAtual = nivelAtualInfo?.beneficios || [];

    if (proximoNivelInfo) {
      pontosParaProximoNivel = proximoNivelInfo.minPontos - pontos;
      
      const pontosNoNivelAtual = pontos - (nivelAtualInfo?.minPontos || 0);
      const totalPontosNecessariosNoNivel = proximoNivelInfo.minPontos - (nivelAtualInfo?.minPontos || 0);

      if (totalPontosNecessariosNoNivel > 0) {
        percentualProgresso = (pontosNoNivelAtual / totalPontosNecessariosNoNivel) * 100;
      }
      
      proximoNivelTitulo = proximoNivelInfo.titulo;
    } else {
      // Usuário está no nível máximo
      pontosParaProximoNivel = 0;
      percentualProgresso = 100; // Já no nível máximo, progresso completo
      proximoNivelTitulo = "Nível Máximo Atingido";
    }

    // Garante que o percentual não ultrapasse 100
    percentualProgresso = Math.min(100, Math.max(0, percentualProgresso));

    res.status(200).json({
      pontosAtuais: pontos,
      nivelAtual: nivelMembro,
      tituloNivelAtual: nivelAtualInfo?.titulo || 'Nível Desconhecido',
      proximoNivel: proximoNivelInfo ? proximoNivelInfo.nivel : null,
      proximoNivelTitulo: proximoNivelTitulo,
      pontosParaProximoNivel: Math.max(0, pontosParaProximoNivel), // Garante que não seja negativo
      percentualProgresso: parseFloat(percentualProgresso.toFixed(2)), // Arredonda para 2 casas decimais
      beneficiosNivelAtual: beneficiosNivelAtual,
      niveisDisponiveis: adicionarPontos.map(nivel => ({
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
 * Retorna as recompensas disponíveis para o usuário logado, filtradas pelo nível mínimo.
 */
export const getRecompensasUsuario = async (req, res) => {
  try {
    const usuarioid = req.usuario.usuarioid; // ID do usuário do token de autenticação

    const usuario = await prisma.usuario.findUnique({
      where: { usuarioid: usuarioid },
      select: {
        pontos: true,
        nivelMembro: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Busca todas as recompensas ativas
    const todasRecompensas = await prisma.recompensa.findMany({
      where: {
        ativo: true,
        // Filtra recompensas que são para o nível do usuário ou níveis anteriores
        nivelMinimo: {
          lte: usuario.nivelMembro,
        },
      },
      orderBy: {
        pontos: 'asc', // Ordena por pontos para facilitar a exibição
      },
    });

    // Filtra entre desbloqueadas e bloqueadas com base nos pontos do usuário
    const unlockedRewards = todasRecompensas.filter(
      (reward) => reward.pontos <= usuario.pontos
    );

    const lockedRewards = todasRecompensas.filter(
      (reward) => reward.pontos > usuario.pontos
    );

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
    const { recompensaid } = req.params; // ID da recompensa a ser resgatada

    // 1. Verificar se a recompensa existe e está ativa
    const recompensa = await prisma.recompensa.findUnique({
      where: { recompensaid: BigInt(recompensaid) },
    });

    if (!recompensa || !recompensa.ativo) {
      return res.status(404).json({ message: 'Recompensa não encontrada ou inativa.' });
    }

    // 2. Verificar se o usuário tem pontos suficientes
    const usuario = await prisma.usuario.findUnique({
      where: { usuarioid: usuarioid },
      select: { pontos: true, nivelMembro: true },
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    if (usuario.pontos < recompensa.pontos) {
      return res.status(400).json({ message: 'Pontos insuficientes para resgatar esta recompensa.' });
    }

    // 3. Verificar o nível mínimo da recompensa
    if (usuario.nivelMembro < recompensa.nivelMinimo) {
      return res.status(403).json({ message: 'Seu nível de membro não é alto o suficiente para resgatar esta recompensa.' });
    }

    // 4. Subtrair pontos do usuário
    // Use a função subtrairPontos do service para manter a lógica centralizada
    const usuarioAtualizado = await prisma.usuario.update({
      where: { usuarioid: usuarioid },
      data: {
        pontos: {
          decrement: recompensa.pontos,
        },
      },
      select: { pontos: true, nivelMembro: true, nome: true },
    });

    // Opcional: Registrar o resgate da recompensa em uma tabela de histórico (Ex: RecompensaResgatada)
    // await prisma.recompensaResgatada.create({
    //   data: {
    //     usuarioid: usuarioid,
    //     recompensaid: recompensa.recompensaid,
    //     dataResgate: new Date(),
    //     pontosGastos: recompensa.pontos,
    //   },
    // });

    console.log(`[Recompensa] Usuário ${usuario.nome} resgatou "${recompensa.titulo}" por ${recompensa.pontos} pontos.`);

    res.status(200).json({
      message: 'Recompensa resgatada com sucesso!',
      pontosAtuais: usuarioAtualizado.pontos,
    });

  } catch (error) {
    console.error('Erro ao resgatar recompensa:', error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor ao resgatar recompensa.' });
  }
};