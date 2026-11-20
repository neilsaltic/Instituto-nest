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
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import 'multer';
@Injectable()
export class TareasService {
  constructor(
    private prisma: PrismaService,
    private pagoService: PagosService,
    private cloudinaryService: CloudinaryService, // <--- Inyectamos Cloudinary
  ) {}

  async crearTarea(dto: CreateTareaDto, usuarioId: number) {
    const profesor = await this.prisma.perfilProfesor.findUnique({
      where: { usuarioId },
    });
    if (!profesor) {
      throw new NotFoundException('Perfil de profesor no encontrado');
    }

    const grupo = await this.prisma.grupo.findUnique({
      where: { id: dto.grupoId },
    });
    if (!grupo) {
      throw new NotFoundException('El grupo no existe');
    }
    if (grupo.profesorId !== profesor.id) {
      throw new ForbiddenException(
        'No puedes crear tareas en un grupo que no tienes asignado',
      );
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

  async entregarTarea(
    dto: SubirEntregaDto,
    usuarioId: number,
    file?: Express.Multer.File, // <--- Recibimos el archivo físico
  ) {
    const estudiante = await this.prisma.perfilEstudiante.findUnique({
      where: { usuarioId },
    });
    if (!estudiante) {
      throw new NotFoundException('Perfil de estudiante no encontrado');
    }

    const tieneMora = await this.pagoService.verificarMoraEstudiante(usuarioId);
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

    // Validamos que envíe al menos un archivo físico, una URL manual o texto
    if (!file && !dto.archivoUrl && !dto.contenidoTexto) {
      throw new BadRequestException(
        'Debes incluir un archivo, un texto o una URL de archivo',
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

    // Si el estudiante adjuntó un archivo físico, lo subimos a Cloudinary
    let urlFinalArchivo = dto.archivoUrl;
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(file);
      urlFinalArchivo = uploadResult.secure_url;
    }

    return await this.prisma.entregaTarea.create({
      data: {
        tareaId: dto.tareaId,
        estudiantePerfilId: estudiante.id,
        contenidoTexto: dto.contenidoTexto,
        archivoUrl: urlFinalArchivo,
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

  async calificarEntrega(
    entregaId: number,
    dto: CalificarEntregaDto,
    usuarioId: number,
  ) {
    const profesor = await this.prisma.perfilProfesor.findUnique({
      where: { usuarioId },
    });
    if (!profesor) {
      throw new NotFoundException('Perfil de profesor no encontrado');
    }

    const entrega = await this.prisma.entregaTarea.findUnique({
      where: { id: entregaId },
      include: { tarea: { include: { grupo: true } } },
    });
    if (!entrega) {
      throw new NotFoundException('La tarea Entregada no existe');
    }
    if (entrega.tarea.grupo.profesorId !== profesor.id) {
      throw new ForbiddenException(
        'No puedes calificar entregas de un grupo que no tienes asignado',
      );
    }

    return await this.prisma.entregaTarea.update({
      where: { id: entregaId },
      data: { calificacion: dto.calificacion },
    });
  }

  async obtenerPendientesRevision(usuarioId: number) {
    const profesor = await this.prisma.perfilProfesor.findUnique({
      where: { usuarioId },
    });
    if (!profesor) {
      throw new NotFoundException('Perfil de profesor no encontrado');
    }

    return this.prisma.entregaTarea.findMany({
      where: {
        calificacion: null,
        tarea: { grupo: { profesorId: profesor.id } },
      },
      include: {
        tarea: {
          include: {
            grupo: { include: { materia: true, periodo: true } },
          },
        },
        estudiantePerfil: {
          include: {
            usuario: {
              select: { id: true, nombre: true, apellido: true, email: true },
            },
          },
        },
      },
      orderBy: { fechaEntrega: 'asc' },
    });
  }

  async obtenerTareasPorGrupo(grupoId: number, usuarioId: number, rol: string) {
    if (rol !== 'ADMINISTRADOR') {
      const profesor = await this.prisma.perfilProfesor.findUnique({
        where: { usuarioId },
      });
      if (!profesor) {
        throw new NotFoundException('Perfil de profesor no encontrado');
      }
      const grupo = await this.prisma.grupo.findUnique({
        where: { id: grupoId },
      });
      if (!grupo) {
        throw new NotFoundException('El grupo no existe');
      }
      if (grupo.profesorId !== profesor.id) {
        throw new ForbiddenException(
          'No tienes permiso para ver las tareas de este grupo',
        );
      }
    }

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
  async obtenerEntregasPorTarea(
    tareaId: number,
    usuarioId: number,
    rol: string,
    grupoId?: number,
  ) {
    const tarea = await this.prisma.tarea.findFirst({
      where: {
        id: tareaId,
        ...(grupoId !== undefined && { grupoId }),
      },
      include: { grupo: true },
    });

    if (!tarea) {
      throw new NotFoundException('La tarea no existe.');
    }

    if (rol !== 'ADMINISTRADOR') {
      const profesor = await this.prisma.perfilProfesor.findUnique({
        where: { usuarioId },
      });
      if (!profesor) {
        throw new NotFoundException('Perfil de profesor no encontrado');
      }
      if (tarea.grupo.profesorId !== profesor.id) {
        throw new ForbiddenException(
          'No tienes permiso para ver las entregas de esta tarea',
        );
      }
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

    const estudiantes = await this.prisma.detalleInscripcion.findMany({
      where: {
        grupoId: tarea.grupoId,
        inscripcion: { periodoId: tarea.grupo.periodoId },
      },
      include: {
        inscripcion: {
          include: {
            estudiantePerfil: {
              include: {
                usuario: {
                  select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        inscripcion: {
          estudiantePerfil: { usuario: { apellido: 'asc' } },
        },
      },
    });

    const entregasPorEstudiante = new Map(
      entregas.map((entrega) => [entrega.estudiantePerfilId, entrega]),
    );

    const resultadoEstudiantes = estudiantes.map((detalle) => {
      const perfil = detalle.inscripcion.estudiantePerfil;
      const entrega = entregasPorEstudiante.get(perfil.id) ?? null;
      let estado = 'NO_ENTREGADA';
      if (entrega) {
        estado =
          entrega.calificacion !== null
            ? 'CALIFICADA'
            : 'PENDIENTE_DE_REVISION';
      }
      return {
        estudiantePerfilId: perfil.id,
        usuario: perfil.usuario,
        estado,
        entrega,
      };
    });

    return {
      resumen: {
        totalEstudiantes: resultadoEstudiantes.length,
        entregadas: resultadoEstudiantes.filter(
          (e) => e.estado.startsWith('PENDIENTE') || e.estado === 'CALIFICADA',
        ).length,
        noEntregadas: resultadoEstudiantes.filter(
          (e) => e.estado === 'NO_ENTREGADA',
        ).length,
        pendientesRevision: resultadoEstudiantes.filter(
          (e) => e.estado === 'PENDIENTE_DE_REVISION',
        ).length,
        calificadas: resultadoEstudiantes.filter(
          (e) => e.estado === 'CALIFICADA',
        ).length,
      },
      estudiantes: resultadoEstudiantes,
    };
  }
}
