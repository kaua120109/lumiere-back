import { OAuth2Client } from 'google-auth-library';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);
const prisma = new PrismaClient();

export const loginComGoogle = async (req, res) => {
    const { credential } = req.body;

    console.log('📩 Credential (código) recebida do front-end:', credential ? 'Sim' : 'Não');

    if (!credential) {
        return res.status(400).json({ message: 'Código de autorização do Google não fornecido.' });
    }

    try {
        // 1. Trocar o código por tokens
        const { tokens } = await client.getToken({
            code: credential,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code',
        });

        console.log('🔍 Resposta da API do Google (tokens):', tokens);

        if (!tokens || !tokens.id_token) {
            console.error('❌ Resposta da API do Google inválida:', tokens);
            return res.status(500).json({ message: 'Resposta inválida da API do Google.', error: 'Token ausente na resposta.' });
        }

        // 2. Usar o ID token para verificar e obter o payload
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        console.log('✅ Dados do Google recebidos:', { email, name, googleId });

        // 3. Lógica para encontrar ou criar o usuário no banco de dados
        let user = await prisma.usuario.findFirst({
            where: {
                OR: [{ email }, { googleId }],
            },
        });

        if (!user) {
            // ✨ Cria um novo usuário
            const baseUsername = email.split('@')[0];
            let usuario = baseUsername;
            let counter = 1;

            while (await prisma.usuario.findFirst({ where: { usuario } })) {
                usuario = `${baseUsername}${counter}`;
                counter++;
            }

            user = await prisma.usuario.create({
                data: {
                    nome: name,
                    usuario,
                    googleId: googleId,
                    email,
                    senha: await bcrypt.hash(googleId, 10),
                    admin: false,
                    imagem: picture,
                },
            });

            console.log('🆕 Novo usuário criado:', user.usuarioid);
        } else {
            // ➕ Atualiza dados do usuário (nome, imagem, etc.), se necessário
            user = await prisma.usuario.update({
                where: { usuarioid: user.usuarioid },
                data: {
                    nome: name,
                    imagem: picture,
                },
            });
            console.log('👤 Usuário já existente:', user.usuarioid);
        }

        // 4. Redirecionar para a página de produtos
        // Certifique-se de que o URL corresponde à sua rota no frontend
        return res.redirect('http://localhost:9090/'); // Ou a rota correta para produtos
    } catch (error) {
        console.error('❌ Erro ao autenticar com Google:', error);
        return res.status(500).json({
            message: 'Erro ao processar login com Google.',
            error: error.message,
        });
    }
};