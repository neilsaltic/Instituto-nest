import { PartialType } from '@nestjs/swagger';
import { CreateProfesorDto } from './create-profesor.dto.js';

export class UpdateProfesorDto extends PartialType(CreateProfesorDto) {}
