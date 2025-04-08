import express from 'express';
import path from 'path';

const app = express();

// Torna a pasta uploads acessível publicamente
app.use('/uploads', express.static(path.resolve('uploads')));

// ... resto das configurações
