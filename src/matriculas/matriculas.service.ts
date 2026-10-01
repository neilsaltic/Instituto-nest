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
}
