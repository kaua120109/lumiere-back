import { imagemSchema } from '../imagens/imagens.schema.js';
import { getBase64Size, MAX_SIZE_BYTES } from '../imagens/imagens.utils.js';

describe('Validação de imagem', () => {
  it('valida base64 PNG válido', () => {
    const data = {
      nome_arquivo: 'teste.png',
      conteudo_base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA',
      mime_type: 'image/png'
    };
    expect(imagemSchema.safeParse(data).success).toBe(true);
  });

  it('rejeita base64 inválido', () => {
    const data = {
      nome_arquivo: 'teste.png',
      conteudo_base64: 'data:image/gif;base64,xxxx',
      mime_type: 'image/gif'
    };
    expect(imagemSchema.safeParse(data).success).toBe(false);
  });

  it('valida tamanho máximo', () => {
    const base64 = 'data:image/png;base64,' + 'A'.repeat(3 * 1024 * 1024); // >2MB
    expect(getBase64Size(base64) > MAX_SIZE_BYTES).toBe(true);
  });
}); 