import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { createToken as gerarToken } from '../jwt.js';

const prisma = new PrismaClient();

// Cadastrar novo membro
export const cadastrarMembro = async (req, res) => {
  try {
    const { nome, usuario, cpf, celular, senha } = req.body;

    // Validar dados
    if (!nome || !usuario || !cpf || !celular || !senha) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    // Verificar se o usuário já existe
    const usuarioExistente = await prisma.usuario.findFirst({
      where: {
        OR: [
          { usuario: usuario },
          { cpf: cpf }
        ]
      }
    });

    if (usuarioExistente) {
      return res.status(409).json({ message: 'Usuário ou CPF já cadastrado' });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);

    // Criar usuário
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        usuario,
        cpf,
        celular,
        senha: senhaCriptografada,
        admin: false,
        ativo: true
      }
    });

    // Criar membro associado ao usuário
    const novoMembro = await prisma.membro.create({
      data: {
        usuarioId: novoUsuario.usuarioid,
        plano: 'BÁSICO', // Plano padrão inicial
        ativo: true,
        dataInicio: new Date(),
        dataExpiracao: null // Sem data de expiração inicialmente
      }
    });

    // Remover a senha do objeto de resposta
    const { senha: _, ...usuarioSemSenha } = novoUsuario;

    return res.status(201).json({
      message: 'Membro cadastrado com sucesso',
      usuario: usuarioSemSenha,
      membro: novoMembro
    });
  } catch (error) {
    console.error('Erro ao cadastrar membro:', error);
    return res.status(500).json({ message: 'Erro ao cadastrar membro' });
  }
};

// Login de membro
export const loginMembro = async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    // Validar dados
    if (!usuario || !senha) {
      return res.status(400).json({ message: 'Usuário e senha são obrigatórios' });
    }

    // Buscar usuário
    const usuarioEncontrado = await prisma.usuario.findFirst({
      where: {
        OR: [
          { usuario: usuario },
          { email: usuario } // Permite login com email ou nome de usuário
        ]
      }
    });

    if (!usuarioEncontrado) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar se o usuário é um membro
    const membroEncontrado = await prisma.membro.findUnique({
      where: {
        usuarioId: usuarioEncontrado.usuarioid
      }
    });

    if (!membroEncontrado) {
      return res.status(403).json({ message: 'Usuário não é um membro' });
    }

    // Verificar se o membro está ativo
    if (!membroEncontrado.ativo) {
      return res.status(403).json({ message: 'Conta de membro inativa' });
    }

    // Verificar se a assinatura expirou
    if (membroEncontrado.dataExpiracao && new Date(membroEncontrado.dataExpiracao) < new Date()) {
      return res.status(403).json({ message: 'Assinatura expirada' });
    }

    // Verificar senha
    const senhaCorreta = await bcrypt.compare(senha, usuarioEncontrado.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = gerarToken({
      id: usuarioEncontrado.usuarioid,
      nome: usuarioEncontrado.nome,
      usuario: usuarioEncontrado.usuario,
      admin: usuarioEncontrado.admin,
      membro: true
    });

    // Remover a senha do objeto de resposta
    const { senha: _, ...usuarioSemSenha } = usuarioEncontrado;

    return res.status(200).json({
      message: 'Login realizado com sucesso',
      usuario: usuarioSemSenha,
      membro: membroEncontrado,
      token
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({ message: 'Erro ao fazer login' });
  }
};

// Cadastro alternativo (para o formulário de inscrição)
export const cadastrarInscricaoMembro = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Validar dados
    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    // Verificar se o email já existe
    const emailExistente = await prisma.usuario.findFirst({
      where: { email }
    });

    if (emailExistente) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);

    // Criar usuário com nome de usuário baseado no email
    const usuario = email.split('@')[0];
    
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        usuario,
        email,
        senha: senhaCriptografada,
        admin: false,
        ativo: true
      }
    });

    // Criar membro associado ao usuário
    const novoMembro = await prisma.membro.create({
      data: {
        usuarioId: novoUsuario.usuarioid,
        plano: 'BÁSICO', // Plano padrão inicial
        ativo: true,
        dataInicio: new Date(),
        dataExpiracao: null // Sem data de expiração inicialmente
      }
    });

    // Gerar token JWT
    const token = gerarToken({
      id: novoUsuario.usuarioid,
      nome: novoUsuario.nome,
      usuario: novoUsuario.usuario,
      admin: novoUsuario.admin,
      membro: true
    });

    // Remover a senha do objeto de resposta
    const { senha: _, ...usuarioSemSenha } = novoUsuario;

    return res.status(201).json({
      message: 'Membro cadastrado com sucesso',
      usuario: usuarioSemSenha,
      membro: novoMembro,
      token
    });
  } catch (error) {
    console.error('Erro ao cadastrar membro:', error);
    return res.status(500).json({ message: 'Erro ao cadastrar membro' });
  }
};