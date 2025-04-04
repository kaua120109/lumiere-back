import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import usuarioRouter from './Usuario/rotasUsuarios.js';
import produtosRouter from './Produto/rotasProdutos.js';
import categoriasRouter from './Categoria/rotasCategorias.js';
import './bigintExtension.js';

dotenv.config();  // Carrega as variáveis do .env

const app = express();

// Atualizando a whitelist para incluir o frontend na porta 9000
const whitelist = ['http://localhost:9090', 'http://localhost:9001', 'http://localhost:9000'];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/usuarios', usuarioRouter);
app.use('/produtos', produtosRouter);
app.use('/categorias', categoriasRouter); 

const PORT = process.env.PORT || 9090;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
