import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { MatriculasService } from './matriculas.service.js';
import { CreateMatriculaDto } from './dto/create-matricula.dto.js';
import { UpdateMatriculaDto } from './dto/update-matricula.dto.js';

@Controller('matriculas')
export class MatriculasController {
  constructor(private readonly matriculasService: MatriculasService) {}

  @Post()
  async matricular(@Body() dto: CreateMatriculaDto) {
    return this.matriculasService.matricular(dto);
  }
  @Patch('detalle/:detalleId')
  async cambiarGrupo(
    @Param('detalleId', ParseIntPipe) detalleId: number,
    @Body() updateDto: UpdateMatriculaDto,
  ) {
    return this.matriculasService.cambiarGrupoMatricula(
      detalleId,
      updateDto.nuevoGrupoId,
    );
  }
}
