import { PartialType } from '@nestjs/mapped-types';
import { CreatePagoDto } from './create-pago.dto.js';

export class UpdatePagoDto extends PartialType(CreatePagoDto) {}
