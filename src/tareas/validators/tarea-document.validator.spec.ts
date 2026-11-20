import { describe, expect, it } from 'vitest';
import { TareaDocumentValidator } from './tarea-document.validator.js';

function archivo(originalname: string, mimetype: string, content: Buffer) {
  return {
    fieldname: 'archivo',
    originalname,
    encoding: '7bit',
    mimetype,
    size: content.length,
    buffer: content,
  } as Express.Multer.File;
}

describe('TareaDocumentValidator', () => {
  const validator = new TareaDocumentValidator();

  it.each([
    ['entrega.pdf', 'application/pdf', Buffer.from('%PDF-1.7')],
    [
      'entrega.doc',
      'application/msword',
      Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
    ],
    [
      'entrega.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      Buffer.from([0x50, 0x4b, 0x03, 0x04]),
    ],
    ['entrega.txt', 'text/plain', Buffer.from('Entrega de texto')],
  ])('acepta %s con contenido del tipo permitido', async (name, mimeType, content) => {
    expect(await validator.isValid(archivo(name, mimeType, content))).toBe(true);
  });

  it('rechaza extensiones no permitidas y contenido que no coincide', async () => {
    expect(
      await validator.isValid(
        archivo('programa.exe', 'application/pdf', Buffer.from('%PDF-1.7')),
      ),
    ).toBe(false);
    expect(
      await validator.isValid(
        archivo('entrega.pdf', 'application/pdf', Buffer.from('no es un PDF')),
      ),
    ).toBe(false);
  });
});
