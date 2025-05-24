import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import { createToken } from "../../jwt.js"

const prisma = new PrismaClient()

// Função de cadastro de inscrição de membro - versão simplificada
async function cadastrarInscricaoMembro(req, res) {
  try {
    console.log("Dados recebidos na rota /inscricao:", req.body)

    const { nome, email, senha, cpf, celular } = req.body

    if (!nome || !email || !senha) {
      return res.status(400).json({ message: "Nome, email e senha são obrigatórios" })
    }

    // Verificar se email já existe
    const emailExistente = await prisma.usuario.findFirst({
      where: { email },
    })

    if (emailExistente) {
      return res.status(409).json({ message: "Email já cadastrado" })
    }

    const salt = await bcrypt.genSalt(10)
    const senhaCriptografada = await bcrypt.hash(senha, salt)

    const usuario = email.split("@")[0]

    // Criar usuário
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        usuario,
        email,
        cpf: cpf || null,
        celular: celular || null,
        senha: senhaCriptografada,
        admin: false,
      },
    })

    // Criar membro
    const novoMembro = await prisma.membro.create({
      data: {
        usuarioid: novoUsuario.usuarioid,
        nome: nome,
        ativo: true,
        dataInicio: new Date(),
        dataExpiracao: null,
      },
    })

    const token = createToken({
      iduser: novoUsuario.usuarioid,
      nome: novoUsuario.nome,
      usuario: novoUsuario.usuario,
      admin: novoUsuario.admin,
      membro: true,
    })

    const { senha: _, ...usuarioSemSenha } = novoUsuario

    return res.status(201).json({
      message: "Membro cadastrado com sucesso",
      usuario: usuarioSemSenha,
      membro: novoMembro,
      token,
    })
  } catch (error) {
    console.error("Erro detalhado ao cadastrar membro:", error)
    return res.status(500).json({
      message: "Erro ao cadastrar membro",
      error: error.message,
    })
  }
}

// Função de cadastro de membro (alternativa)
async function cadastrarMembro(req, res) {
  return cadastrarInscricaoMembro(req, res)
}

// Função de login do membro
async function loginMembro(req, res) {
  try {
    const { email, senha } = req.body

    if (!email || !senha) {
      return res.status(400).json({ message: "Email e senha são obrigatórios" })
    }

    const usuario = await prisma.usuario.findFirst({
      where: { email },
      include: {
        membro: true,
      },
    })

    if (!usuario) {
      return res.status(401).json({ message: "Email ou senha inválidos" })
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha)

    if (!senhaValida) {
      return res.status(401).json({ message: "Email ou senha inválidos" })
    }

    const token = createToken({
      iduser: usuario.usuarioid,
      nome: usuario.nome,
      usuario: usuario.usuario,
      admin: usuario.admin,
      membro: true,
    })

    const { senha: _, ...usuarioSemSenha } = usuario

    return res.status(200).json({
      message: "Login realizado com sucesso",
      usuario: usuarioSemSenha,
      token,
    })
  } catch (error) {
    console.error("Erro ao realizar login:", error)
    return res.status(500).json({ message: "Erro ao realizar login" })
  }
}

export { cadastrarInscricaoMembro, loginMembro, cadastrarMembro }
