// src/router/services/pontosService.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Níveis de recompensa configurados
// Mantenha esta lista atualizada com os níveis do seu programa
const NIVEIS_RECOMPENSA = [
  { nivel: 1, minPontos: 0, maxPontos: 999, titulo: "Membro Iniciante", beneficios: ["Bônus de boas-vindas", "Frete grátis em compras acima de R$100"] },
  { nivel: 2, minPontos: 1000, maxPontos: 2999, titulo: "Membro Bronze", beneficios: ["Todos os benefícios de Nível 1", "Ofertas exclusivas para membros", "Desconto de 5% em todos os produtos"] },
  { nivel: 3, minPontos: 3000, maxPontos: 8999, titulo: "Membro Prata", beneficios: ["Todos os benefícios do Nível 2", "Acesso antecipado a produtos", "Desconto de 10% em todos os produtos", "Suporte prioritário"] },
  { nivel: 4, minPontos: 9000, maxPontos: Infinity, titulo: "Membro Ouro", beneficios: ["Todos os benefícios do Nível 3", "Desconto de 15% em todos os produtos", "Acesso a eventos exclusivos", "Presente de aniversário"] },
];

/**
 * Função interna para verificar e atualizar o nível do usuário com base nos pontos.
 * Esta função deve ser chamada sempre que os pontos do usuário são alterados.
 * @param {number} usuarioId - O ID do usuário.
 */
async function verificarNivelUsuario(usuarioId) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { usuarioid: usuarioId },
      select: { pontos: true, nivelMembro: true, nome: true },
    });

    if (!usuario) {
      console.warn(`[Níveis] Usuário ${usuarioId} não encontrado.`);
      return;
    }

    let novoNivel = usuario.nivelMembro;
    let nivelEncontrado = NIVEIS_RECOMPENSA[0]; // Começa com o nível iniciante
    
    // Encontrar o maior nível que o usuário atingiu com base nos pontos
    for (const nivelConfig of NIVEIS_RECOMPENSA) {
      if (usuario.pontos >= nivelConfig.minPontos) {
        novoNivel = nivelConfig.nivel;
        nivelEncontrado = nivelConfig;
      } else {
        // Como os níveis estão em ordem crescente de pontos, podemos parar aqui
        break; 
      }
    }

    if (novoNivel !== usuario.nivelMembro) {
      await prisma.usuario.update({
        where: { usuarioid: usuarioId },
        data: { nivelMembro: novoNivel },
      });

      console.log(`🎉 ${usuario.nome} (ID ${usuarioId}) subiu para Nível ${novoNivel} (${nivelEncontrado?.titulo})`);
    }
  } catch (error) {
    console.error(`[Níveis] Erro ao atualizar nível do usuário ${usuarioId}:`, error);
  }
}

/**
 * Adiciona pontos ao usuário e revalida o nível.
 * @param {number} usuarioId - O ID do usuário.
 * @param {number} pontosParaAdicionar - A quantidade de pontos a serem adicionados.
 * @returns {Promise<Object>} O objeto do usuário atualizado.
 */
async function adicionarPontos(usuarioId, pontosParaAdicionar) {
  try {
    const usuarioAtualizado = await prisma.usuario.update({
      where: { usuarioid: usuarioId },
      data: {
        pontos: {
          increment: pontosParaAdicionar,
        },
      },
      select: {
        usuarioid: true,
        pontos: true,
        nivelMembro: true,
        nome: true,
      },
    });

    console.log(`[Pontos] +${pontosParaAdicionar} para ${usuarioAtualizado.nome}. Total: ${usuarioAtualizado.pontos}`);

    await verificarNivelUsuario(usuarioAtualizado.usuarioid);

    return usuarioAtualizado;
  } catch (error) {
    console.error(`[Pontos] Erro ao adicionar pontos ao usuário ${usuarioId}:`, error);
    throw new Error('Falha ao adicionar pontos.');
  }
}

/**
 * Subtrai pontos do usuário e revalida o nível.
 * @param {number} usuarioId - O ID do usuário.
 * @param {number} pontosParaSubtrair - A quantidade de pontos a serem subtraídos.
 * @returns {Promise<Object>} O objeto do usuário atualizado.
 */
async function subtrairPontos(usuarioId, pontosParaSubtrair) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { usuarioid: usuarioId },
      select: { pontos: true },
    });

    if (!usuario || usuario.pontos < pontosParaSubtrair) {
      throw new Error('Pontos insuficientes.');
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { usuarioid: usuarioId },
      data: {
        pontos: {
          decrement: pontosParaSubtrair,
        },
      },
      select: {
        usuarioid: true,
        pontos: true,
        nivelMembro: true,
      },
    });

    console.log(`[Pontos] -${pontosParaSubtrair} de ${usuarioId}. Total: ${usuarioAtualizado.pontos}`);

    await verificarNivelUsuario(usuarioAtualizado.usuarioid); // Revalida o nível após a subtração

    return usuarioAtualizado;
  } catch (error) {
    console.error(`[Pontos] Erro ao subtrair pontos do usuário ${usuarioId}:`, error);
    throw new Error('Falha ao subtrair pontos.');
  }
}

export { adicionarPontos, subtrairPontos, NIVEIS_RECOMPENSA };