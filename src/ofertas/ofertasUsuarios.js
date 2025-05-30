import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const ofertasUsuarios = {
    // Listar todas as ofertas com status de visualização do usuário
    async listarOfertasUsuarios(usuarioId = null) {
        try {
            const whereClause = usuarioId ? { usuarioid: Number.parseInt(usuarioId) } : {}
            
            const ofertasUsuarios = await prisma.ofertaUsuario.findMany({
                where: whereClause,
                include: {
                    usuario: {
                        select: {
                            usuarioid: true,
                            nome: true,
                            email: true
                        }
                    },
                    oferta: {
                        include: {
                            produto: {
                                include: {
                                    categoria: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    data: 'desc'
                }
            })
            
            return ofertasUsuarios
        } catch (error) {
            console.error("Erro ao listar ofertas de usuários:", error)
            throw new Error("Erro ao listar ofertas de usuários")
        }
    },

    // Criar nova relação oferta-usuário
    async criarOfertaUsuario(dados) {
        try {
            // Verificar se já existe a relação
            const existeRelacao = await prisma.ofertaUsuario.findUnique({
                where: {
                    usuarioid_ofertaid: {
                        usuarioid: Number.parseInt(dados.usuarioId),
                        ofertaid: BigInt(dados.ofertaId)
                    }
                }
            })

            if (existeRelacao) {
                throw new Error("Usuário já tem esta oferta associada")
            }

            const novaOfertaUsuario = await prisma.ofertaUsuario.create({
                data: {
                    usuarioid: Number.parseInt(dados.usuarioId),
                    ofertaid: BigInt(dados.ofertaId),
                    visualizado: dados.visualizado || false
                },
                include: {
                    usuario: {
                        select: {
                            usuarioid: true,
                            nome: true,
                            email: true
                        }
                    },
                    oferta: {
                        include: {
                            produto: {
                                include: {
                                    categoria: true
                                }
                            }
                        }
                    }
                }
            })

            return novaOfertaUsuario
        } catch (error) {
            console.error("Erro ao criar oferta de usuário:", error)
            throw error
        }
    },

    // Marcar oferta como visualizada
    async marcarComoVisualizada(usuarioId, ofertaId) {
        try {
            const ofertaAtualizada = await prisma.ofertaUsuario.update({
                where: {
                    usuarioid_ofertaid: {
                        usuarioid: Number.parseInt(usuarioId),
                        ofertaid: BigInt(ofertaId)
                    }
                },
                data: {
                    visualizado: true
                },
                include: {
                    usuario: {
                        select: {
                            usuarioid: true,
                            nome: true,
                            email: true
                        }
                    },
                    oferta: {
                        include: {
                            produto: {
                                include: {
                                    categoria: true
                                }
                            }
                        }
                    }
                }
            })

            return ofertaAtualizada
        } catch (error) {
            console.error("Erro ao marcar oferta como visualizada:", error)
            throw new Error("Erro ao atualizar oferta de usuário")
        }
    },

    // Atualizar oferta de usuário (genérico)
    async atualizarOfertaUsuario(id, dados) {
        try {
            const ofertaAtualizada = await prisma.ofertaUsuario.update({
                where: { 
                    id: BigInt(id) 
                },
                data: {
                    visualizado: dados.visualizado !== undefined ? dados.visualizado : undefined
                },
                include: {
                    usuario: {
                        select: {
                            usuarioid: true,
                            nome: true,
                            email: true
                        }
                    },
                    oferta: {
                        include: {
                            produto: {
                                include: {
                                    categoria: true
                                }
                            }
                        }
                    }
                }
            })

            return ofertaAtualizada
        } catch (error) {
            console.error("Erro ao atualizar oferta de usuário:", error)
            throw new Error("Erro ao atualizar oferta de usuário")
        }
    },

    // Excluir relação oferta-usuário
    async excluirOfertaUsuario(id) {
        try {
            const ofertaExcluida = await prisma.ofertaUsuario.delete({
                where: { 
                    id: BigInt(id) 
                }
            })

            return ofertaExcluida
        } catch (error) {
            console.error("Erro ao excluir oferta de usuário:", error)
            throw new Error("Erro ao excluir oferta de usuário")
        }
    },

    // Buscar ofertas não visualizadas de um usuário
    async obterOfertasNaoVisualizadas(usuarioId) {
        try {
            const ofertasNaoVisualizadas = await prisma.ofertaUsuario.findMany({
                where: {
                    usuarioid: Number.parseInt(usuarioId),
                    visualizado: false
                },
                include: {
                    oferta: {
                        include: {
                            produto: {
                                include: {
                                    categoria: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    data: 'desc'
                }
            })

            return ofertasNaoVisualizadas
        } catch (error) {
            console.error("Erro ao buscar ofertas não visualizadas:", error)
            throw new Error("Erro ao buscar ofertas não visualizadas")
        }
    },

    // Contar ofertas não visualizadas
    async contarOfertasNaoVisualizadas(usuarioId) {
        try {
            const count = await prisma.ofertaUsuario.count({
                where: {
                    usuarioid: Number.parseInt(usuarioId),
                    visualizado: false
                }
            })

            return count
        } catch (error) {
            console.error("Erro ao contar ofertas não visualizadas:", error)
            throw new Error("Erro ao contar ofertas não visualizadas")
        }
    },

    // Marcar todas as ofertas do usuário como visualizadas
    async marcarTodasComoVisualizadas(usuarioId) {
        try {
            const resultado = await prisma.ofertaUsuario.updateMany({
                where: {
                    usuarioid: Number.parseInt(usuarioId),
                    visualizado: false
                },
                data: {
                    visualizado: true
                }
            })

            return resultado
        } catch (error) {
            console.error("Erro ao marcar todas as ofertas como visualizadas:", error)
            throw new Error("Erro ao marcar todas as ofertas como visualizadas")
        }
    }
}

export { ofertasUsuarios }