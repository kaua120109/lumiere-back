import { z } from 'zod';

export const imagemSchema = z.object({
  nome_arquivo: z.string().min(1),
  conteudo_base64: z.string().refine((val) => {
    return /^data:image\/(png|jpeg);base64,/.test(val);
  }, { message: 'Base64 inválido ou tipo não suportado (apenas PNG/JPEG)' }),
  mime_type: z.enum(['image/png', 'image/jpeg']),
}); 