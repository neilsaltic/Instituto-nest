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

  async entregarTarea(dto: SubirEntregaDto, usuarioId: number) {
    const estudiante = await this.prisma.perfilEstudiante.findUnique({
      where: { usuarioId },
    });
    if (!estudiante) {
      throw new NotFoundException('Perfil de estudiante no encontrado');
    }

    const tieneMora = await this.pagoService.verificarMoraEstudiante(
      usuarioId,
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

    const inscripcion = await this.prisma.detalleInscripcion.findFirst({
      where: {
        grupoId: tarea.grupoId,
        inscripcion: {
          estudiantePerfilId: estudiante.id,
          periodo: { activo: true },
        },
      },
    });
    if (!inscripcion) {
      throw new ForbiddenException(
        'No puedes entregar tareas de una materia en la que no estás inscrito',
      );
    }

    return await this.prisma.entregaTarea.create({
      data: {
        tareaId: dto.tareaId,
        estudiantePerfilId: estudiante.id,
        contenidoTexto: dto.contenidoTexto,
        archivoUrl: dto.archivoUrl,
      },
    });
  }

  async obtenerMisTareas(usuarioId: number) {
    const estudiante = await this.prisma.perfilEstudiante.findUnique({
      where: { usuarioId },
    });
    if (!estudiante) {
      throw new NotFoundException('Perfil de estudiante no encontrado');
    }

    const inscripciones = await this.prisma.detalleInscripcion.findMany({
      where: {
        inscripcion: {
          estudiantePerfilId: estudiante.id,
          periodo: { activo: true },
        },
      },
      select: { grupoId: true },
    });
    const grupoIds = [...new Set(inscripciones.map((item) => item.grupoId))];

    if (grupoIds.length === 0) {
      return [];
    }

    const tareas = await this.prisma.tarea.findMany({
      where: { grupoId: { in: grupoIds } },
      include: {
        grupo: {
          include: {
            materia: true,
            profesor: {
              include: {
                usuario: {
                  select: { nombre: true, apellido: true, email: true },
                },
              },
            },
          },
        },
        entregas: {
          where: { estudiantePerfilId: estudiante.id },
          take: 1,
        },
      },
      orderBy: [{ fechaLimite: 'asc' }],
    });

    const ahora = new Date();
    return tareas.map((tarea) => {
      const entrega = tarea.entregas[0] ?? null;
      return {
        ...tarea,
        estadoEntrega: entrega ? 'ENTREGADA' : 'PENDIENTE',
        estadoPlazo:
          ahora > tarea.fechaLimite ? 'VENCIDA' : 'PENDIENTE_DE_VENCIMIENTO',
        entrega,
      };
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
