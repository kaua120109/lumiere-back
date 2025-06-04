// src/router/repo/membro.js
// Este arquivo agora se concentrará apenas em operações específicas de gerenciamento de membros.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Exemplo: Função para atualizar o status de um membro (se houver necessidade de gestão granular)
// export const membroService = {
//   async atualizarStatusMembro(usuarioId, status, dataExpiracao = null) {
//     try {
//       const membroAtualizado = await prisma.membro.update({
//         where: { usuarioId: Number.parseInt(usuarioId) },
//         data: { ativo: status, dataExpiracao: dataExpiracao },
//       });
//       return membroAtualizado;
//     } catch (error) {
//       console.error("Erro ao atualizar status do membro:", error);
//       throw error;
//     }
//   },
//   // Outras funções de gerenciamento de membro...
// };

// As funções `cadastrarInscricaoMembro` e `loginMembro` originais foram removidas.
// Suas funcionalidades foram integradas em `repoUsuarios.js`.