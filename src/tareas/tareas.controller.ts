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
  Query,
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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Rol } from '../generated/prisma/enums.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';

@ApiTags('Tareas')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tareas')
export class TareasController {
  constructor(private readonly tareasService: TareasService) {}

  @ApiOperation({
    summary: 'Obtener las tareas de las materias inscritas (Solo Estudiante)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tareas del estudiante obtenida exitosamente.',
  })
  @Roles(Rol.ESTUDIANTE)
  @Get('mis-tareas')
  async obtenerMisTareas(@GetUser('id') usuarioId: number) {
    return this.tareasService.obtenerMisTareas(usuarioId);
  }

  @ApiOperation({ summary: 'Crear una nueva tarea (Solo Profesor)' })
  @ApiResponse({ status: 201, description: 'Tarea creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido para este rol.' })
  @Roles(Rol.PROFESOR)
  @Post()
  async crearTarea(
    @GetUser('id') usuarioId: number,
    @Body() dto: CreateTareaDto,
  ) {
    return this.tareasService.crearTarea(dto, usuarioId);
  }

  @ApiOperation({ summary: 'Subir entrega de una tarea (Solo Estudiante)' })
  @ApiResponse({ status: 201, description: 'Entrega registrada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrega inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido para este rol.' })
  @Roles('ESTUDIANTE')
  @Post('entregar')
  async entregarTarea(
    @GetUser('id') usuarioId: number,
    @Body() dto: SubirEntregaDto,
  ) {
    return this.tareasService.entregarTarea(dto, usuarioId);
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
    @GetUser('id') usuarioId: number,
  ) {
    return this.tareasService.calificarEntrega(entregaId, dto, usuarioId);
  }

  @ApiOperation({
    summary: 'Listar entregas pendientes de revisión del profesor',
  })
  @Roles(Rol.PROFESOR)
  @Get('pendientes-revision')
  async obtenerPendientesRevision(@GetUser('id') usuarioId: number) {
    return this.tareasService.obtenerPendientesRevision(usuarioId);
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
  async obtenerTareasPorGrupo(
    @Param('grupoId', ParseIntPipe) grupoId: number,
    @GetUser() usuario: any,
  ) {
    return this.tareasService.obtenerTareasPorGrupo(
      grupoId,
      usuario.id,
      usuario.rol,
    );
  }

  @ApiOperation({
    summary: 'Obtener el padrón del grupo y el estado de entrega de una tarea',
  })
  @ApiParam({ name: 'grupoId', description: 'ID del grupo', type: Number })
  @ApiQuery({
    name: 'tareaId',
    description: 'ID de la tarea del grupo que se desea consultar',
    type: Number,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description:
      'Incluye a todos los estudiantes inscritos, también a quienes no entregaron la tarea.',
  })
  @Roles('PROFESOR', 'ADMINISTRADOR')
  @Get('grupo/:grupoId/estudiantes')
  async obtenerPadronEstudiantesPorGrupo(
    @Param('grupoId', ParseIntPipe) grupoId: number,
    @Query('tareaId', ParseIntPipe) tareaId: number,
    @GetUser() usuario: any,
  ) {
    return this.tareasService.obtenerEntregasPorTarea(
      tareaId,
      usuario.id,
      usuario.rol,
      grupoId,
    );
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
    @GetUser() usuario: any,
  ) {
    return this.tareasService.obtenerEntregasPorTarea(
      tareaId,
      usuario.id,
      usuario.rol,
    );
  }
}
