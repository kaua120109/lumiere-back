import { imagemSchema } from './imagens.schema.js';
import { getBase64Size, MAX_SIZE_BYTES } from './imagens.utils.js';
import * as service from './imagens.service.js';
import logger from '../logger/logger.js';

export async function uploadImagem(req, res, next) {
  try {
    let { nome_arquivo, conteudo_base64, mime_type } = req.body;

    if (req.file) {
      nome_arquivo = req.file.originalname;
      mime_type = req.file.mimetype;
      conteudo_base64 = `data:${mime_type};base64,${req.file.buffer.toString('base64')}`;
    }

    // Log preview do base64 para debug sem poluir
    logger.info('Recebendo imagem', {
      nome_arquivo,
      mime_type,
      preview_base64: conteudo_base64?.substring(0, 50) + '...'
    });

    const parsed = imagemSchema.safeParse({ nome_arquivo, conteudo_base64, mime_type });
    if (!parsed.success) {
      logger.warn('Erro de validação', { errors: parsed.error.errors });
      return res.status(400).json({ message: 'Erro de validação', errors: parsed.error.errors });
    }

    const size = getBase64Size(conteudo_base64);
    if (size > MAX_SIZE_BYTES) {
      logger.warn('Imagem excede 2MB', { nome_arquivo, size });
      return res.status(400).json({ message: 'Imagem excede o tamanho máximo de 2MB' });
    }

    const imagem = await service.salvarImagem({ nome_arquivo, conteudo_base64, mime_type });
    logger.info('Imagem salva', { id: imagem.id });
    return res.status(201).json({
      message: 'Imagem salva com sucesso',
      imagem: { id: imagem.id, nome_arquivo: imagem.nome_arquivo, mime_type: imagem.mime_type, criado_em: imagem.criado_em }
    });
  } catch (err) {
    logger.error('Erro ao salvar imagem', { error: err });
    res.status(500).json({ message: 'Erro interno ao salvar imagem.' });
  }
}

export async function getImagem(req, res, next) {
  try {
    const { id } = req.params;
    const imagem = await service.buscarImagemPorId(id);
    if (!imagem) {
      return res.status(404).json({ message: 'Imagem não encontrada' });
    }
    return res.status(200).json({
      id: imagem.id,
      nome_arquivo: imagem.nome_arquivo,
      conteudo_base64: imagem.conteudo_base64,
      mime_type: imagem.mime_type,
      criado_em: imagem.criado_em
    });
  } catch (err) {
    logger.error('Erro ao buscar imagem', { error: err });
    next(err);
  }
} 