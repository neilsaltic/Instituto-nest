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
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('materias')
export class MateriasController {
  constructor(private readonly materiasService: MateriasService) {}

  @ApiOperation({ summary: 'Crear una nueva materia (Solo Administrador)' })
  @ApiResponse({ status: 201, description: 'Materia registrada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido para este rol.' })
  @ApiResponse({
    status: 409,
    description: 'El código de la materia ya se encuentra registrado.',
  })
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
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @Get()
  async findAll() {
    return this.materiasService.findAll();
  }

  @ApiOperation({ summary: 'Obtener los detalles de una materia por su ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la materia a consultar',
    type: Number,
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Materia encontrada.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'La materia no fue encontrada.' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.materiasService.findOne(id);
  }

  @ApiOperation({
    summary: 'Actualizar una materia existente (Solo Administrador)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la materia a actualizar',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Materia actualizada correctamente.',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido para este rol.' })
  @ApiResponse({ status: 404, description: 'La materia no fue encontrada.' })
  @ApiResponse({
    status: 409,
    description: 'El nuevo código ya está asignado a otra materia.',
  })
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
  @ApiParam({
    name: 'id',
    description: 'ID de la materia',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de profesores obtenida exitosamente.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido para este rol.' })
  @ApiResponse({ status: 404, description: 'La materia no fue encontrada.' })
  @Roles('ADMINISTRADOR')
  @Get(':id/profesores')
  async obtenerProfesoresPorMateria(
    @Param('id', ParseIntPipe) materiaId: number,
  ) {
    return this.materiasService.obtenerProfesoresPorMateria(materiaId);
  }
}
