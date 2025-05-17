import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { createToken } from '../jwt.js';

const prisma = new PrismaClient();

// Função corrigida
async function cadastrarInscricaoMembro(req, res) {
  try {
    console.log('Dados recebidos na rota /inscricao:', req.body);

    const { nome, email, senha, cpf, celular } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
    }

    const emailExistente = await prisma.usuario.findFirst({
      where: { email }
    });

    if (emailExistente) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);

    const usuario = email.split('@')[0];

    // CORREÇÃO: Remover o campo 'ativo' do objeto de dados
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        usuario,
        email,
        cpf: cpf || null,
        celular: celular || null,
        senha: senhaCriptografada,
        admin: false
        // ativo: true  <- Remover esta linha
      }
    });

    // O campo 'ativo' existe no modelo membro, então pode ser usado aqui
    const novoMembro = await prisma.membro.create({
      data: {
        usuarioid: novoUsuario.usuarioid,
        ativo: true,  // Este campo existe no modelo membro
        dataInicio: new Date(),
        dataExpiracao: null
      }
    });

    const token = createToken({
      iduser: novoUsuario.usuarioid,
      nome: novoUsuario.nome,
      usuario: novoUsuario.usuario,
      admin: novoUsuario.admin,
      membro: true
    });

    const { senha: _, ...usuarioSemSenha } = novoUsuario;

    return res.status(201).json({
      message: 'Membro cadastrado com sucesso',
      usuario: usuarioSemSenha,
      membro: novoMembro,
      token
    });
  } catch (error) {
    console.error('Erro detalhado ao cadastrar membro:', error);
    if (error.code) {
      console.error('Código do erro Prisma:', error.code);
      console.error('Meta informações:', error.meta);
    }
    return res.status(500).json({ 
      message: 'Erro ao cadastrar membro', 
      error: error.message,
      code: error.code
    });
  }
}

// Também corrija a função cadastrarMembro da mesma forma
async function cadastrarMembro(req, res) {
  try {
    const { nome, email, senha, cpf, celular } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
    }

    const emailExistente = await prisma.usuario.findFirst({
      where: { email }
    });

    if (emailExistente) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);

    const usuario = email.split('@')[0];

    // CORREÇÃO: Remover o campo 'ativo' do objeto de dados
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        usuario,
        email,
        cpf: cpf || null,
        celular: celular || null,
        senha: senhaCriptografada,
        admin: false
        // ativo: true  <- Remover esta linha
      }
    });

    const novoMembro = await prisma.membro.create({
      data: {
        usuarioid: novoUsuario.usuarioid,
        ativo: true,
        dataInicio: new Date(),
        dataExpiracao: null
      }
    });

    const token = createToken({
      iduser: novoUsuario.usuarioid,
      nome: novoUsuario.nome,
      usuario: novoUsuario.usuario,
      admin: novoUsuario.admin,
      membro: true
    });

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
}

// Função de login do membro (deve estar fora de cadastrarMembro)
async function loginMembro(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    const usuario = await prisma.usuario.findFirst({
      where: { email }
    });

    if (!usuario) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const token = createToken({
      iduser: usuario.usuarioid,
      nome: usuario.nome,
      usuario: usuario.usuario,
      admin: usuario.admin,
      membro: true
    });

    const { senha: _, ...usuarioSemSenha } = usuario;

    return res.status(200).json({
      message: 'Login realizado com sucesso',
      usuario: usuarioSemSenha,
      token
    });
  } catch (error) {
    console.error('Erro ao realizar login:', error);
    return res.status(500).json({ message: 'Erro ao realizar login' });
  }
}

// No final do arquivo membro.js, deve haver:
export {
  cadastrarInscricaoMembro,
  loginMembro,
  cadastrarMembro  // Certifique-se de que esta linha existe
};

// A função loginMembro não precisa de alterações

console.log("Código corrigido: removi o campo 'ativo' do objeto de dados ao criar um usuário");