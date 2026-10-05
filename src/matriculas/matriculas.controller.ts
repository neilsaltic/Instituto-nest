import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MatriculasService } from './matriculas.service.js';
import { CreateMatriculaDto } from './dto/create-matricula.dto.js';
import { UpdateMatriculaDto } from './dto/update-matricula.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorators.js';
import { ApiOperation } from '@nestjs/swagger';
import { Rol } from '../generated/prisma/enums.js';

@Controller('matriculas')
export class MatriculasController {
  constructor(private readonly matriculasService: MatriculasService) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.RECEPCIONISTA)
  @Post()
  async matricular(@Body() dto: CreateMatriculaDto) {
    return this.matriculasService.matricular(dto);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.RECEPCIONISTA)
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
  @Get('mis-materias')
  @Roles(Rol.ESTUDIANTE)
  @ApiOperation({
    summary:
      'Obtener la lista de materias/grupos en los que está inscrito el estudiante autenticado (Solo Estudiante)',
  })
  async obtenerMisMaterias(@Req() req: any) {
    return this.matriculasService.obtenerMisMaterias(req.user.id);
  }
  @ApiOperation({ summary: 'Obtener oferta académica de materias disponibles' })
  @Get('oferta')
  obtenerOferta() {
    return this.matriculasService.obtenerOfertaAcademica();
  }

  // Ver detalles completos y grupos de una materia específica por su ID
  @ApiOperation({ summary: 'Obtener detalle de una materia y sus cupos' })
  @Get('materias/:id')
  obtenerDetalleMateria(@Param('id', ParseIntPipe) materiaId: number) {
    return this.matriculasService.obtenerDetalleMateria(materiaId);
  }
  // Consulta el catálogo general completo de materias
  @ApiOperation({
    summary:
      'Obtener todas las materias del catálogo general con estado de cupos',
  })
  @Get('materias')
  obtenerTodasLasMaterias() {
    return this.matriculasService.obtenerTodasLasMaterias();
  }
}
