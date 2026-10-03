import { PartialType } from '@nestjs/swagger';
import { CreateTareaDto } from './create-tarea.dto.js';

export class UpdateTareaDto extends PartialType(CreateTareaDto) {}
