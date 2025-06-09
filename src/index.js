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
import googleRouter from './GoogleLogin/rotasGoogle.js'; // Nova importação

// IMPORTANTE:
// renomeie a importação para ser mais clara sobre o que ela contém
// O arquivo rotaRecompensas.js agora conterá tanto as rotas de recompensas quanto a de progresso.
import recompensaEProgramaRouter from './RecompensasMembro/rotaRecompensas.js'; 

import rotasEventos from './Eventos/rotasEventos.js'

// REMOVA ESTA LINHA:
// import rotasPrograma from './Programa/rotasPrograma.js';

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
app.use('/membros', membroRouter); // Nova rota
app.use('/logingg', googleRouter); // Nova rota para autenticação

// Monta as rotas de recompensas E a rota de resgate.
// A rota raiz '/' dentro de rotaRecompensas.js será '/recompensas' aqui.
// A rota '/resgatar/:id' dentro de rotaRecompensas.js será '/recompensas/resgatar/:id' aqui.
app.use('/recompensas', recompensaEProgramaRouter);

// Monta a rota de progresso.
// A rota '/progresso' dentro de rotaRecompensas.js será '/programa/progresso' aqui.
app.use('/programa', recompensaEProgramaRouter);

app.use('/eventos', rotasEventos);

// REMOVA ESTA LINHA:
// app.use('/programa', rotasPrograma);


const PORT = process.env.PORT || 9090;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});