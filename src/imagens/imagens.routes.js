import { Router } from 'express';
import multer from 'multer';
import * as controller from './imagens.controller.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('imagem'), controller.uploadImagem);
router.post('/upload-base64', controller.uploadImagem); // Para JSON base64
router.get('/:id', controller.getImagem);

export default router; 