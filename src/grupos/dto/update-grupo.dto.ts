import { PartialType } from '@nestjs/swagger';
import { CreateGrupoDto } from './create-grupo.dto.js';

export class UpdateGrupoDto extends PartialType(CreateGrupoDto) {}
