import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTareaDto } from './dto/create-tarea.dto.js';
import { UpdateTareaDto } from './dto/update-tarea.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PagosService } from '../pagos/pagos.service.js';
import { SubirEntregaDto } from './dto/subir-entrega.dto.js';
import { CalificarEntregaDto } from './dto/calificar-entrega.dto.js';

@Injectable()
export class TareasService {
  constructor(
    private prisma: PrismaService,
    private pagoService: PagosService,
  ) {}

  async crearTarea(dto: CreateTareaDto) {
    const grupo = await this.prisma.grupo.findUnique({
      where: { id: dto.grupoId },
    });
    if (!grupo) {
      throw new NotFoundException('El grupo no existe');
    }

    return await this.prisma.tarea.create({
      data: {
        grupoId: dto.grupoId,
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        fechaLimite: new Date(dto.fechaLimite),
      },
    });
  }

  async entregarTarea(dto: SubirEntregaDto) {
    const tieneMora = await this.pagoService.verificarMoraEstudiante(
      dto.estudiantePerfilId,
    );
    if (tieneMora) {
      throw new ForbiddenException(
        'Acceso denegado: El estudiante tiene deudas pendientes',
      );
    }
    const tarea = await this.prisma.tarea.findUnique({
      where: { id: dto.tareaId },
    });

    if (!tarea) {
      throw new NotFoundException('La tarea no existe');
    }
    if (new Date() > new Date(tarea.fechaLimite)) {
      throw new BadRequestException(
        'El plazo limite de la fecha de entrega ya vencio',
      );
    }
    if (!dto.archivoUrl && !dto.contenidoTexto) {
      throw new BadRequestException(
        'debes incluir un texto o un Url de archivo',
      );
    }

    return await this.prisma.entregaTarea.create({
      data: {
        tareaId: dto.tareaId,
        estudiantePerfilId: dto.estudiantePerfilId,
        contenidoTexto: dto.contenidoTexto,
        archivoUrl: dto.archivoUrl,
      },
    });
  }

  async calificarEntrega(entregaId: number, dto: CalificarEntregaDto) {
    const entrega = await this.prisma.entregaTarea.findUnique({
      where: { id: entregaId },
    });
    if (!entrega) {
      throw new NotFoundException('La tarea Entregada no existe');
    }
    return await this.prisma.entregaTarea.update({
      where: { id: entregaId },
      data: { calificacion: dto.calificacion },
    });
  }

  async obtenerTareasPorGrupo(grupoId: number) {
    return await this.prisma.tarea.findMany({
      where: { grupoId },
      include: {
        _count: {
          select: { entregas: true }, // Muestra cuántos alumnos han enviado la tarea
        },
      },
      orderBy: { fechaLimite: 'desc' },
    });
  }
  async obtenerEntregasPorTarea(tareaId: number) {
    const tarea = await this.prisma.tarea.findUnique({
      where: { id: tareaId },
    });

    if (!tarea) {
      throw new NotFoundException('La tarea no existe.');
    }

    const entregas = await this.prisma.entregaTarea.findMany({
      where: { tareaId },
      include: {
        estudiantePerfil: {
          include: {
            usuario: {
              select: { nombre: true, apellido: true, email: true },
            },
          },
        },
      },
      orderBy: { fechaEntrega: 'asc' },
    });

    return entregas.map((entrega) => ({
      ...entrega,
      estadoCalificacion:
        entrega.calificacion !== null ? 'CALIFICADA' : 'PENDIENTE',
    }));
  }
}
