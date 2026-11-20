import { FileValidator } from '@nestjs/common';
import { extname } from 'node:path';

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export class TareaDocumentValidator extends FileValidator<
  Record<string, never>,
  Express.Multer.File
> {
  constructor() {
    super({});
  }

  isValid(file?: Express.Multer.File): boolean {
    if (!file?.buffer) return false;

    const extension = extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype.toLowerCase();
    const header = file.buffer.subarray(0, 8);

    if (extension === '.pdf') {
      return (
        mimeType === 'application/pdf' &&
        header.subarray(0, 5).toString('ascii') === '%PDF-'
      );
    }
    if (extension === '.doc') {
      return (
        mimeType === 'application/msword' &&
        header.equals(
          Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
        )
      );
    }
    if (extension === '.docx') {
      return (
        mimeType === DOCX_MIME &&
        header.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))
      );
    }
    if (extension === '.txt') {
      return mimeType === 'text/plain' && !file.buffer.includes(0);
    }
    return false;
  }

  buildErrorMessage(): string {
    return 'El archivo debe ser un PDF, Word (.doc/.docx) o TXT válido.';
  }
}
