import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class PedidoService {
  // Buscar pedidos do usuário
  static async buscarPedidosUsuario(usuarioid, pagina = 1, limite = 10) {
    try {
      const skip = (pagina - 1) * limite

      const pedidos = await prisma.pedido.findMany({
        where: { usuarioid },
        include: {
          itens: {
            include: {
              produto: {
                select: {
                  nome: true,
                  imagens: true,
                  categoria: true
                }
              }
            }
          },
          endereco: true,
          rastreamento: {
            orderBy: { data: 'desc' }
          }
        },
        orderBy: { criadoEm: 'desc' },
        skip,
        take: limite
      })

      const total = await prisma.pedido.count({
        where: { usuarioid }
      })

      return {
        pedidos,
        total,
        paginas: Math.ceil(total / limite),
        paginaAtual: pagina
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error)
      throw error
    }
  }

  // Buscar pedido específico
  static async buscarPedido(pedidoid, usuarioid) {
    try {
      return await prisma.pedido.findFirst({
        where: { 
          pedidoid,
          usuarioid 
        },
        include: {
          itens: {
            include: {
              produto: true
            }
          },
          endereco: true,
          rastreamento: {
            orderBy: { data: 'asc' }
          }
        }
      })
    } catch (error) {
      console.error('Erro ao buscar pedido:', error)
      throw error
    }
  }

  // Gerar número do pedido
  static gerarNumeroPedido() {
    const timestamp = Date.now().toString()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `AD${timestamp.slice(-6)}${random}`
  }

  // Criar novo pedido
  static async criarPedido(dadosPedido) {
    try {
      const numero = this.gerarNumeroPedido()

      return await prisma.pedido.create({
        data: {
          ...dadosPedido,
          numero,
          itens: {
            create: dadosPedido.itens
          },
          rastreamento: {
            create: {
              status: 'pedido_confirmado',
              descricao: 'Pedido confirmado e sendo preparado'
            }
          }
        },
        include: {
          itens: {
            include: {
              produto: true
            }
          }
        }
      })
    } catch (error) {
      console.error('Erro ao criar pedido:', error)
      throw error
    }
  }
}