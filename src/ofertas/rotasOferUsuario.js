import { Router } from "express"
import { ofertasUsuarios } from "../ofertas/ofertasUsuarios.js"
import { verificarAutenticacao } from "../middleware/auth.js"

const router = Router()

// Rota para listar ofertas de usuários (todas ou de um usuário específico)
router.get("/listar-ofertas-usuarios", verificarAutenticacao, async (req, res) => {
    try {
        const { usuarioId } = req.query
        const ofertas = await ofertasUsuarios.listarOfertasUsuarios(usuarioId)
        res.status(200).json(ofertas)
    } catch (error) {
        console.error("Erro ao listar ofertas de usuários:", error)
        res.status(500).json({ 
            message: error.message,
            error: "Erro interno do servidor"
        })
    }
})

// Rota para criar uma nova relação oferta-usuário
router.post("/criar-oferta-usuario", verificarAutenticacao, async (req, res) => {
    try {
        const dados = req.body
        
        // Validar dados obrigatórios
        if (!dados.usuarioId || !dados.ofertaId) {
            return res.status(400).json({ 
                message: "usuarioId e ofertaId são obrigatórios" 
            })
        }

        const novaOfertaUsuario = await ofertasUsuarios.criarOfertaUsuario(dados)
        res.status(201).json(novaOfertaUsuario)
    } catch (error) {
        console.error("Erro ao criar oferta de usuário:", error)
        
        if (error.message === "Usuário já tem esta oferta associada") {
            return res.status(409).json({ message: error.message })
        }
        
        res.status(500).json({ 
            message: error.message,
            error: "Erro interno do servidor"
        })
    }
})

// Rota para marcar oferta como visualizada
router.patch("/marcar-visualizada/:usuarioId/:ofertaId", verificarAutenticacao, async (req, res) => {
    try {
        const { usuarioId, ofertaId } = req.params
        const ofertaAtualizada = await ofertasUsuarios.marcarComoVisualizada(usuarioId, ofertaId)
        res.status(200).json(ofertaAtualizada)
    } catch (error) {
        console.error("Erro ao marcar oferta como visualizada:", error)
        res.status(500).json({ 
            message: error.message,
            error: "Erro interno do servidor"
        })
    }
})

// Rota para atualizar uma oferta de usuário (genérica)
router.put("/atualizar-oferta-usuario/:id", verificarAutenticacao, async (req, res) => {
    try {
        const { id } = req.params
        const dados = req.body
        
        const ofertaAtualizada = await ofertasUsuarios.atualizarOfertaUsuario(id, dados)
        res.status(200).json(ofertaAtualizada)
    } catch (error) {
        console.error("Erro ao atualizar oferta de usuário:", error)
        res.status(500).json({ 
            message: error.message,
            error: "Erro interno do servidor"
        })
    }
})

// Rota para excluir uma oferta de usuário
router.delete("/excluir-oferta-usuario/:id", verificarAutenticacao, async (req, res) => {
    try {
        const { id } = req.params
        await ofertasUsuarios.excluirOfertaUsuario(id)
        res.status(204).send()
    } catch (error) {
        console.error("Erro ao excluir oferta de usuário:", error)
        res.status(500).json({ 
            message: error.message,
            error: "Erro interno do servidor"
        })
    }
})

// Rota para obter ofertas não visualizadas de um usuário
router.get("/ofertas-nao-visualizadas/:usuarioId", verificarAutenticacao, async (req, res) => {
    try {
        const { usuarioId } = req.params
        const ofertasNaoVisualizadas = await ofertasUsuarios.obterOfertasNaoVisualizadas(usuarioId)
        res.status(200).json(ofertasNaoVisualizadas)
    } catch (error) {
        console.error("Erro ao buscar ofertas não visualizadas:", error)
        res.status(500).json({ 
            message: error.message,
            error: "Erro interno do servidor"
        })
    }
})

// Rota para contar ofertas não visualizadas
router.get("/contar-nao-visualizadas/:usuarioId", verificarAutenticacao, async (req, res) => {
    try {
        const { usuarioId } = req.params
        const count = await ofertasUsuarios.contarOfertasNaoVisualizadas(usuarioId)
        res.status(200).json({ count })
    } catch (error) {
        console.error("Erro ao contar ofertas não visualizadas:", error)
        res.status(500).json({ 
            message: error.message,
            error: "Erro interno do servidor"
        })
    }
})

// Rota para marcar todas as ofertas do usuário como visualizadas
router.patch("/marcar-todas-visualizadas/:usuarioId", verificarAutenticacao, async (req, res) => {
    try {
        const { usuarioId } = req.params
        const resultado = await ofertasUsuarios.marcarTodasComoVisualizadas(usuarioId)
        res.status(200).json({ 
            message: "Todas as ofertas foram marcadas como visualizadas",
            ofertasAtualizadas: resultado.count
        })
    } catch (error) {
        console.error("Erro ao marcar todas as ofertas como visualizadas:", error)
        res.status(500).json({ 
            message: error.message,
            error: "Erro interno do servidor"
        })
    }
})

export default router