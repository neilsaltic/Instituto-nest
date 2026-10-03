import { PartialType } from '@nestjs/swagger';
import { CreatePeriodoDto } from './create-periodo.dto.js';

export class UpdatePeriodoDto extends PartialType(CreatePeriodoDto) {}
