import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class ConteudoService {
  // Buscar conteúdos para o feed
  static async buscarConteudosFeed(usuarioid, pagina = 1, limite = 10) {
    try {
      const skip = (pagina - 1) * limite

      const conteudos = await prisma.conteudo.findMany({
        where: { ativo: true },
        include: {
          usuarios: {
            where: { usuarioid },
            select: {
              visualizado: true,
              favoritado: true,
              progresso: true
            }
          }
        },
        orderBy: { criadoEm: 'desc' },
        skip,
        take: limite
      })

      return conteudos.map(conteudo => ({
        ...conteudo,
        interacao: conteudo.usuarios[0] || {
          visualizado: false,
          favoritado: false,
          progresso: 0
        }
      }))
    } catch (error) {
      console.error('Erro ao buscar conteúdos:', error)
      throw error
    }
  }

  // Marcar conteúdo como visualizado
  static async marcarVisualizado(usuarioid, conteudoid) {
    try {
      return await prisma.conteudoUsuario.upsert({
        where: {
          usuarioid_conteudoid: {
            usuarioid,
            conteudoid
          }
        },
        update: {
          visualizado: true
        },
        create: {
          usuarioid,
          conteudoid,
          visualizado: true
        }
      })
    } catch (error) {
      console.error('Erro ao marcar como visualizado:', error)
      throw error
    }
  }

  // Favoritar/desfavoritar conteúdo
  static async alternarFavorito(usuarioid, conteudoid) {
    try {
      const interacao = await prisma.conteudoUsuario.findUnique({
        where: {
          usuarioid_conteudoid: {
            usuarioid,
            conteudoid
          }
        }
      })

      if (interacao) {
        return await prisma.conteudoUsuario.update({
          where: {
            usuarioid_conteudoid: {
              usuarioid,
              conteudoid
            }
          },
          data: {
            favoritado: !interacao.favoritado
          }
        })
      } else {
        return await prisma.conteudoUsuario.create({
          data: {
            usuarioid,
            conteudoid,
            favoritado: true
          }
        })
      }
    } catch (error) {
      console.error('Erro ao alterar favorito:', error)
      throw error
    }
  }
}