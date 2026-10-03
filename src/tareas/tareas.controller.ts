import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TareasService } from './tareas.service.js';
import { CreateTareaDto } from './dto/create-tarea.dto.js';
import { UpdateTareaDto } from './dto/update-tarea.dto.js';
import { SubirEntregaDto } from './dto/subir-entrega.dto.js';
import { CalificarEntregaDto } from './dto/calificar-entrega.dto.js';
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

@ApiTags('Tareas')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tareas')
export class TareasController {
  constructor(private readonly tareasService: TareasService) {}

  @ApiOperation({ summary: 'Crear una nueva tarea (Solo Profesor)' })
  @ApiResponse({ status: 201, description: 'Tarea creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido para este rol.' })
  @Roles('PROFESOR')
  @Post()
  async crearTarea(@Body() dto: CreateTareaDto) {
    return this.tareasService.crearTarea(dto);
  }

  @ApiOperation({ summary: 'Subir entrega de una tarea (Solo Estudiante)' })
  @ApiResponse({ status: 201, description: 'Entrega registrada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrega inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido para este rol.' })
  @Roles('ESTUDIANTE')
  @Post('entregar')
  async entregarTarea(@Body() dto: SubirEntregaDto) {
    return this.tareasService.entregarTarea(dto);
  }

  @ApiOperation({
    summary: 'Calificar la entrega de un estudiante (Solo Profesor)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la entrega a calificar',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Calificación asignada correctamente.',
  })
  @ApiResponse({ status: 404, description: 'La entrega no fue encontrada.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido para este rol.' })
  @Roles('PROFESOR')
  @Patch('entregas/:id/calificar')
  async calificarEntrega(
    @Param('id', ParseIntPipe) entregaId: number,
    @Body() dto: CalificarEntregaDto,
  ) {
    return this.tareasService.calificarEntrega(entregaId, dto);
  }

  @ApiOperation({
    summary: 'Obtener todas las tareas de un grupo (Profesor y Administrador)',
  })
  @ApiParam({ name: 'grupoId', description: 'ID del grupo', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista de tareas del grupo obtenida exitosamente.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido para este rol.' })
  @Roles('PROFESOR', 'ADMINISTRADOR')
  @Get('grupo/:grupoId')
  async obtenerTareasPorGrupo(@Param('grupoId', ParseIntPipe) grupoId: number) {
    return this.tareasService.obtenerTareasPorGrupo(grupoId);
  }

  @ApiOperation({
    summary:
      'Obtener todas las entregas de una tarea específica (Profesor y Administrador)',
  })
  @ApiParam({ name: 'tareaId', description: 'ID de la tarea', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista de entregas obtenida exitosamente.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido para este rol.' })
  @Roles('PROFESOR', 'ADMINISTRADOR')
  @Get(':tareaId/entregas')
  async obtenerEntregasPorTarea(
    @Param('tareaId', ParseIntPipe) tareaId: number,
  ) {
    return this.tareasService.obtenerEntregasPorTarea(tareaId);
  }
}
