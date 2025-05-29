import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { PrismaClient } from "@prisma/client";
import { createToken } from "../jwt.js";

const router = Router();
const prisma = new PrismaClient();

// Configure o client OAuth2 do Google
const client = new OAuth2Client('313923627712-aieb631ltnddvbna3o83vdn72r1q9b5t.apps.googleusercontent.com');

router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ message: 'Código de autorização não fornecido' });
    }

    // Trocar o código de autorização por tokens
    const { tokens } = await client.getToken(credential);
    client.setCredentials(tokens);

    // Obter informações do usuário do Google
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: '313923627712-aieb631ltnddvbna3o83vdn72r1q9b5t.apps.googleusercontent.com'
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    // Verificar se o usuário já existe no banco
    let usuario = await prisma.usuario.findFirst({
      where: {
        OR: [
          { usuario: email },
          { googleId: googleId }
        ]
      }
    });

    // Se não existe, criar novo usuário
    if (!usuario) {
      usuario = await prisma.usuario.create({
        data: {
          usuario: email,
          nome: name,
          googleId: googleId,
          senha: null, // Usuários do Google não precisam de senha local
          cpf: null,
          celular: null,
          admin: false
        }
      });
    } else {
      // Se existe mas não tem googleId, atualizar
      if (!usuario.googleId) {
        usuario = await prisma.usuario.update({
          where: { usuarioid: usuario.usuarioid },
          data: { googleId: googleId }
        });
      }
    }

    // Criar token JWT
    const token = createToken({
      iduser: usuario.usuarioid,
      nome: usuario.nome,
      admin: usuario.admin
    });

    res.status(200).json({
      message: "Login com Google realizado com sucesso!",
      token: token,
      usuario: {
        usuarioid: usuario.usuarioid,
        nome: usuario.nome,
        usuario: usuario.usuario,
        admin: usuario.admin
      }
    });

  } catch (error) {
    console.error('Erro na autenticação Google:', error);
    res.status(500).json({ 
      message: 'Erro ao autenticar com Google',
      error: error.message 
    });
  }
});

export default router;