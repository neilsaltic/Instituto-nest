import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMatriculaDto } from './dto/create-matricula.dto.js';
import { UpdateMatriculaDto } from './dto/update-matricula.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { existeTraslapeHorario } from './utils/horario.utils.js';
import { PagosService } from '../pagos/pagos.service.js';

@Injectable()
export class MatriculasService {
  constructor(
    private prisma: PrismaService,
    private readonly pagosService: PagosService,
  ) {}

  async matricular(matriculaDto: CreateMatriculaDto) {
    const tieneMora = await this.pagosService.verificarMoraEstudiante(
      matriculaDto.estudiantePerfilId,
    );
    if (tieneMora) {
      throw new ForbiddenException(
        'No puedes realizar nuevas matrículas debido a que presentas deudas vencidas.',
      );
    }
    const { estudiantePerfilId, grupoId } = matriculaDto;
    const grupoObjetivo = await this.prisma.grupo.findUnique({
      where: { id: grupoId },
      include: {
        materia: true,
        periodo: true,
        horarios: true,
        detallesInscripcion: true,
      },
    });
    if (!grupoObjetivo) {
      throw new NotFoundException('El grupo no existe');
    }
    if (!grupoObjetivo.periodo.activo) {
      throw new BadRequestException(
        'El periodo academico no se encuentra activo',
      );
    }
    const incritosActuales = grupoObjetivo.detallesInscripcion.length;
    if (incritosActuales >= grupoObjetivo.cupoMaximo) {
      throw new BadRequestException(
        `el grupo ${grupoObjetivo.nombre} ha alcanzado su cupo limite de ${grupoObjetivo.cupoMaximo} estudiantes`,
      );
    }
    let inscripcion = await this.prisma.inscripcion.findUnique({
      where: {
        estudiantePerfilId_periodoId: {
          estudiantePerfilId,
          periodoId: grupoObjetivo.periodoId,
        },
      },
      include: {
        detalles: {
          include: {
            grupo: {
              include: {
                materia: true,
                horarios: true,
              },
            },
          },
        },
      },
    });
    if (inscripcion) {
      const detalleExiste = inscripcion.detalles;
      const yainscritoMatertia = detalleExiste.some(
        (d) => d.grupo.materiaId === grupoObjetivo.materiaId,
      );
      if (yainscritoMatertia) {
        throw new ConflictException(
          `El estudiante ya esta Incrito en la materia ${grupoObjetivo.materia.nombre} en este periodo`,
        );
      }
      const creditosActuales = detalleExiste.reduce(
        (sum, d) => sum + d.grupo.materia.creditos,
        0,
      );
      const nuevosCreditos = creditosActuales + grupoObjetivo.materia.creditos;

      if (nuevosCreditos > grupoObjetivo.periodo.limiteCreditos) {
        throw new BadRequestException(
          `La matricula excede a el limite de creditos ${grupoObjetivo.periodo.limiteCreditos}, creditos actuales: ${creditosActuales}, creditos materia: ${grupoObjetivo.materia.creditos} `,
        );
      }

      for (const detalle of detalleExiste) {
        const horarioGrupoInscrito = detalle.grupo.horarios;
        for (const hInscrito of horarioGrupoInscrito) {
          for (const hNuevo of grupoObjetivo.horarios) {
            if (existeTraslapeHorario(hInscrito, hNuevo)) {
              throw new ConflictException(
                `Existe un Translape de horario con la materia: ${detalle.grupo.materia.nombre} el dia: ${hNuevo.diaSemana} entre ${hNuevo.horaInicio} y ${hNuevo.horaFin}`,
              );
            }
          }
        }
      }
    }

    return await this.prisma.$transaction(async (tx) => {
      if (!inscripcion) {
        inscripcion = await tx.inscripcion.create({
          data: {
            estudiantePerfilId,
            periodoId: grupoObjetivo.periodoId,
          },
          include: {
            detalles: {
              include: {
                grupo: {
                  include: {
                    materia: true,
                    horarios: true,
                  },
                },
              },
            },
          },
        });
      }

      const detalleCreado = await tx.detalleInscripcion.create({
        data: {
          inscripcionId: inscripcion.id,
          grupoId: grupoObjetivo.id,
        },
        include: {
          grupo: {
            include: {
              materia: true,
            },
          },
        },
      });

      return {
        mensaje: 'Matricula Registrada exitosamente',
        detalle: detalleCreado,
      };
    });
  }
  async cambiarGrupoMatricula(
    detalleInscripcionId: number,
    nuevoGrupoId: number,
  ) {
    const detalleActual = await this.prisma.detalleInscripcion.findUnique({
      where: { id: detalleInscripcionId },
      include: {
        grupo: { include: { materia: true } },
        inscripcion: {
          include: {
            detalles: {
              include: {
                grupo: { include: { materia: true, horarios: true } },
              },
            },
            periodo: true,
          },
        },
      },
    });

    if (!detalleActual) {
      throw new NotFoundException('El registro de materia inscrita no existe.');
    }

    if (detalleActual.grupoId === nuevoGrupoId) {
      throw new BadRequestException(
        'El estudiante ya se encuentra en este grupo.',
      );
    }

    // 2. Obtener la información del nuevo grupo objetivo
    const nuevoGrupo = await this.prisma.grupo.findUnique({
      where: { id: nuevoGrupoId },
      include: {
        materia: true,
        periodo: true,
        horarios: true,
        detallesInscripcion: true,
      },
    });

    if (!nuevoGrupo) {
      throw new NotFoundException('El nuevo grupo especificado no existe.');
    }

    if (nuevoGrupo.periodoId !== detalleActual.inscripcion.periodoId) {
      throw new BadRequestException(
        'No puedes cambiar a un grupo de un periodo académico diferente.',
      );
    }

    // 3. Validación de Cupo Máximo en el nuevo grupo
    if (nuevoGrupo.detallesInscripcion.length >= nuevoGrupo.cupoMaximo) {
      throw new BadRequestException(
        `El nuevo grupo ${nuevoGrupo.nombre} ha alcanzado su cupo máximo de ${nuevoGrupo.cupoMaximo} estudiantes.`,
      );
    }

    // 4. Filtrar los detalles omitiendo la materia/grupo que estamos cambiando
    const otrosDetallesInscritos = detalleActual.inscripcion.detalles.filter(
      (d) => d.id !== detalleInscripcionId,
    );

    // 5. Validación de Doble Inscripción (si cambia a una materia distinta)
    if (nuevoGrupo.materiaId !== detalleActual.grupo.materiaId) {
      const yaInscritoOtraMateria = otrosDetallesInscritos.some(
        (d) => d.grupo.materiaId === nuevoGrupo.materiaId,
      );
      if (yaInscritoOtraMateria) {
        throw new ConflictException(
          `El estudiante ya está inscrito en la materia '${nuevoGrupo.materia.nombre}' en este periodo.`,
        );
      }

      // Validación de Créditos (solo si la nueva materia tiene más créditos que la anterior)
      const creditosOtrasMaterias = otrosDetallesInscritos.reduce(
        (sum, d) => sum + d.grupo.materia.creditos,
        0,
      );
      const nuevosCreditosTotales =
        creditosOtrasMaterias + nuevoGrupo.materia.creditos;

      if (
        nuevosCreditosTotales > detalleActual.inscripcion.periodo.limiteCreditos
      ) {
        throw new BadRequestException(
          `El cambio excede el límite de créditos (${detalleActual.inscripcion.periodo.limiteCreditos}). Total resultante: ${nuevosCreditosTotales}.`,
        );
      }
    }

    // 6. Validación de Traslape de Horarios con las OTRAS materias inscritas
    for (const detalle of otrosDetallesInscritos) {
      for (const hInscrito of detalle.grupo.horarios) {
        for (const hNuevo of nuevoGrupo.horarios) {
          if (existeTraslapeHorario(hInscrito, hNuevo)) {
            throw new ConflictException(
              `Existe un traslape de horario con la materia '${detalle.grupo.materia.nombre}' el día ${hNuevo.diaSemana} entre ${hNuevo.horaInicio} y ${hNuevo.horaFin}.`,
            );
          }
        }
      }
    }

    // 7. Actualizar el registro del detalle de inscripción
    const detalleActualizado = await this.prisma.detalleInscripcion.update({
      where: { id: detalleInscripcionId },
      data: { grupoId: nuevoGrupoId },
      include: {
        grupo: {
          include: { materia: true, horarios: true },
        },
      },
    });

    return {
      mensaje: 'Cambio de grupo registrado exitosamente.',
      detalle: detalleActualizado,
    };
  }
  // 1. Obtener toda la oferta de materias en el periodo académico activo
  async obtenerOfertaAcademica() {
    return await this.prisma.materia.findMany({
      where: {
        grupos: {
          some: {
            periodo: { activo: true },
          },
        },
      },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        creditos: true,
        costoInscripcion: true,
        costoMensualidad: true,
        grupos: {
          where: {
            periodo: { activo: true },
          },
          select: {
            id: true,
            nombre: true,
            cupoMaximo: true,
            _count: {
              select: { detallesInscripcion: true },
            },
            horarios: {
              select: {
                diaSemana: true,
                horaInicio: true,
                horaFin: true,
              },
            },
            profesor: {
              select: {
                usuario: {
                  select: {
                    nombre: true,
                    apellido: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  // 2. Obtener la información detallada de una materia en específico
  async obtenerDetalleMateria(materiaId: number) {
    const materia = await this.prisma.materia.findUnique({
      where: { id: materiaId },
      include: {
        grupos: {
          where: {
            periodo: { activo: true },
          },
          include: {
            periodo: {
              select: {
                id: true,
                nombre: true,
                limiteCreditos: true,
              },
            },
            horarios: {
              select: {
                diaSemana: true,
                horaInicio: true,
                horaFin: true,
              },
            },
            profesor: {
              include: {
                usuario: {
                  select: {
                    nombre: true,
                    apellido: true,
                    email: true,
                  },
                },
              },
            },
            detallesInscripcion: true,
          },
        },
      },
    });

    if (!materia) {
      throw new NotFoundException('La materia solicitada no existe.');
    }

    // Formatear la respuesta calculando el cupo disponible de cada grupo
    const gruposConCupo = materia.grupos.map((grupo) => {
      const inscritos = grupo.detallesInscripcion.length;
      const { detallesInscripcion, ...restoGrupo } = grupo;
      return {
        ...restoGrupo,
        inscritosActuales: inscritos,
        cuposDisponibles: grupo.cupoMaximo - inscritos,
      };
    });

    return {
      id: materia.id,
      codigo: materia.codigo,
      nombre: materia.nombre,
      creditos: materia.creditos,
      costoInscripcion: materia.costoInscripcion,
      costoMensualidad: materia.costoMensualidad,
      gruposAcademicos: gruposConCupo,
    };
  }
  // Obtener todas las materias del catálogo (activas, inactivas, con o sin cupo)
  async obtenerTodasLasMaterias() {
    const materias = await this.prisma.materia.findMany({
      include: {
        grupos: {
          include: {
            periodo: {
              select: {
                id: true,
                nombre: true,
                activo: true,
              },
            },
            horarios: {
              select: {
                diaSemana: true,
                horaInicio: true,
                horaFin: true,
              },
            },
            profesor: {
              select: {
                usuario: {
                  select: {
                    nombre: true,
                    apellido: true,
                  },
                },
              },
            },
            _count: {
              select: { detallesInscripcion: true },
            },
          },
        },
      },
    });

    // Mapear la respuesta para incluir el cálculo explícito de cupos
    return materias.map((materia) => ({
      id: materia.id,
      codigo: materia.codigo,
      nombre: materia.nombre,
      creditos: materia.creditos,
      costoInscripcion: materia.costoInscripcion,
      costoMensualidad: materia.costoMensualidad,
      totalGrupos: materia.grupos.length,
      grupos: materia.grupos.map((grupo) => {
        const inscritos = grupo._count.detallesInscripcion;
        const disponibles = grupo.cupoMaximo - inscritos;

        return {
          id: grupo.id,
          nombre: grupo.nombre,
          periodo: grupo.periodo.nombre,
          periodoActivo: grupo.periodo.activo,
          cupoMaximo: grupo.cupoMaximo,
          inscritosActuales: inscritos,
          cuposDisponibles: disponibles > 0 ? disponibles : 0,
          estaLleno: disponibles <= 0,
          profesor: grupo.profesor
            ? `${grupo.profesor.usuario.nombre} ${grupo.profesor.usuario.apellido}`
            : 'Sin asignar',
          horarios: grupo.horarios,
        };
      }),
    }));
  }
}
