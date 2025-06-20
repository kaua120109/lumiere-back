// lumiere-back/src/index.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';

import usuarioRouter from './Usuario/rotasUsuarios.js';
import produtosRouter from './Produto/rotasProdutos.js';
import categoriasRouter from './Categoria/rotasCategorias.js';
import historiasRouter from './Historias/rotasHistorias.js';
import membroRouter from './membro/rotasMembro.js';
import googleRouter from './GoogleLogin/rotasGoogle.js';
import recompensaEProgramaRouter from './RecompensasMembro/rotaRecompensas.js'; 
import rotasEventos from './Eventos/rotasEventos.js'
import conteudosRouter from './ConteudosMembro/rotasConteudos.js'; // Caminho de importação correto


import './bigintExtension.js';

dotenv.config();

// Obter o diretório atual para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Garantir que o diretório uploads existe
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Usar path.resolve para obter o caminho absoluto
app.use('/uploads', express.static(uploadsDir));

const whitelist = ['http://localhost:9090', 'http://localhost:9001', 'http://localhost:9000'];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Servidor está funcionando',
    timestamp: new Date().toISOString()
  });
}
);

app.use(cors(corsOptions));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Permitir acesso a recursos de origens diferentes
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/usuarios', usuarioRouter);
app.use('/produtos', produtosRouter);
app.use('/categorias', categoriasRouter); 
app.use('/historias', historiasRouter);
app.use('/membros', membroRouter);
app.use('/logingg', googleRouter);
app.use('/recompensas', recompensaEProgramaRouter);
app.use('/programa', recompensaEProgramaRouter); // Esta linha deve permanecer se rotaRecompensas.js também contém rotas para '/programa'
app.use('/eventos', rotasEventos);
app.use('/conteudos', conteudosRouter); // Montagem do router de conteúdos

const PORT = process.env.PORT || 9090;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});