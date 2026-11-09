import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MateriasService } from './materias.service.js';
import { CreateMateriaDto } from './dto/create-materia.dto.js';
import { UpdateMateriaDto } from './dto/update-materia.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorators.js';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Materias')
@Controller('materias')
export class MateriasController {
  constructor(private readonly materiasService: MateriasService) {}

  @ApiOperation({ summary: 'Crear una nueva materia (Solo Administrador)' })
  @ApiBearerAuth('JWT-auth') // Indicamos que este sí pide token
  @UseGuards(JwtAuthGuard, RolesGuard) // Guard a nivel de método
  @Roles('ADMINISTRADOR')
  @Post()
  async create(@Body() createMateriaDto: CreateMateriaDto) {
    return this.materiasService.create(createMateriaDto);
  }

  @ApiOperation({ summary: 'Listar todas las materias' })
  @ApiResponse({
    status: 200,
    description: 'Lista de materias obtenida exitosamente.',
  })
  @Get() // <--- LIBRE / PÚBLICO (Sin guards)
  async findAll() {
    return this.materiasService.findAll();
  }

  @ApiOperation({ summary: 'Obtener los detalles de una materia por su ID' })
  @Get(':id') // <--- LIBRE / PÚBLICO (Sin guards)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.materiasService.findOne(id);
  }

  @ApiOperation({
    summary: 'Actualizar una materia existente (Solo Administrador)',
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMateriaDto: UpdateMateriaDto,
  ) {
    return this.materiasService.update(id, updateMateriaDto);
  }

  @ApiOperation({
    summary:
      'Obtener los profesores asignados a una materia (Solo Administrador)',
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  @Get(':id/profesores')
  async obtenerProfesoresPorMateria(
    @Param('id', ParseIntPipe) materiaId: number,
  ) {
    return this.materiasService.obtenerProfesoresPorMateria(materiaId);
  }
}
