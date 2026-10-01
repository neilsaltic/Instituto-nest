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

@UseGuards(JwtAuthGuard)
@Controller('tareas')
export class TareasController {
  constructor(private readonly tareasService: TareasService) {}

  @Post()
  async crearTarea(@Body() dto: CreateTareaDto) {
    return this.tareasService.crearTarea(dto);
  }

  // Estudiante entrega tarea
  @Post('entregar')
  async entregarTarea(@Body() dto: SubirEntregaDto) {
    return this.tareasService.entregarTarea(dto);
  }

  // Docente califica entrega
  @Patch('entregas/:id/calificar')
  async calificarEntrega(
    @Param('id', ParseIntPipe) entregaId: number,
    @Body() dto: CalificarEntregaDto,
  ) {
    return this.tareasService.calificarEntrega(entregaId, dto);
  }
  @Get('grupo/:grupoId')
  async obtenerTareasPorGrupo(@Param('grupoId', ParseIntPipe) grupoId: number) {
    return this.tareasService.obtenerTareasPorGrupo(grupoId);
  }

  @Get(':tareaId/entregas')
  async obtenerEntregasPorTarea(
    @Param('tareaId', ParseIntPipe) tareaId: number,
  ) {
    return this.tareasService.obtenerEntregasPorTarea(tareaId);
  }
}
