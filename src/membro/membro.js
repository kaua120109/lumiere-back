import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import { createToken } from "../jwt.js"// Ajuste o caminho
import { adicionarPontos } from '../service/pontosService.js';
; // Importa o serviço de pontos

const prisma = new PrismaClient()

// Função de cadastro de inscrição de membro - versão simplificada
async function cadastrarInscricaoMembro(req, res) {
  try {

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

    const usuarioLogin = email.split("@")[0] // Define o campo 'usuario' como a parte inicial do email

    // Criar usuário
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        usuario: usuarioLogin, // Preenche o campo 'usuario'
        email,
        cpf: cpf || null,
        celular: celular || null,
        senha: senhaCriptografada,
        admin: false,
        pontos: 0, // Inicializa com 0 pontos
        nivelMembro: 1, // Inicializa no nível 1
      },
    })

    // Criar membro
    const novoMembro = await prisma.membro.create({
      data: {
        usuarioid: novoUsuario.usuarioid,
        nome: novoUsuario.nome,
        dataInicio: new Date(),
        ativo: true,
      },
    })

    // --- ADICIONAR PONTOS AQUI: Bônus de boas-vindas para novos membros ---
    const pontosBoasVindasMembro = 200; // Defina a quantidade de pontos de boas-vindas para membros
    await adicionarPontos(novoUsuario.usuarioid, pontosBoasVindasMembro);
    console.log(`[Pontos] Bônus de boas-vindas de membro de ${pontosBoasVindasMembro} pontos para ${novoUsuario.nome}.`);
    // --- FIM DA ADIÇÃO DE PONTOS ---

    const token = createToken({
      iduser: novoUsuario.usuarioid,
      nome: novoUsuario.nome,
      usuario: novoUsuario.usuario,
      admin: novoUsuario.admin,
      membro: true, // Indica que o usuário é um membro
      pontos: novoUsuario.pontos + pontosBoasVindasMembro, // Inclui os pontos iniciais e de bônus
      nivelMembro: novoUsuario.nivelMembro, // Inclui o nível inicial
    })


    res.status(201).json({
      message: "Membro cadastrado com sucesso",
      usuario: {
        usuarioid: novoUsuario.usuarioid,
        nome: novoUsuario.nome,
        usuario: novoUsuario.usuario,
        email: novoUsuario.email,
        pontos: novoUsuario.pontos + pontosBoasVindasMembro, // Retorna os pontos já com o bônus
        nivelMembro: novoUsuario.nivelMembro,
      },
      membro: novoMembro,
      token,
    })
  } catch (error) {
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
      membro: usuario.membro ? true : false, // Indica se o usuário é um membro
      pontos: usuario.pontos, // Inclui os pontos no token
      nivelMembro: usuario.nivelMembro, // Inclui o nível no token
    })

    res.status(200).json({
      message: "Login bem-sucedido!",
      token,
      usuario: {
        usuarioid: usuario.usuarioid,
        nome: usuario.nome,
        usuario: usuario.usuario,
        email: usuario.email,
        admin: usuario.admin,
        membro: usuario.membro, // Retorna o objeto membro completo se existir
        pontos: usuario.pontos, // Retorna os pontos
        nivelMembro: usuario.nivelMembro, // Retorna o nível
      },
    })
  } catch (error) {
    console.error("Erro no login do membro:", error)
    return res.status(500).json({ message: "Erro interno do servidor." })
  }
}

export { cadastrarInscricaoMembro, cadastrarMembro, loginMembro }