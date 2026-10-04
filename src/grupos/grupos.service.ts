import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateGrupoDto } from './dto/create-grupo.dto.js';
import { UpdateGrupoDto } from './dto/update-grupo.dto.js';

@Injectable()
export class GruposService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGrupoDto: CreateGrupoDto) {
    const { materiaId, periodoId, profesorId, horarios, ...rest } =
      createGrupoDto;

    // Verificar existencia de entidades
    const materia = await this.prisma.materia.findUnique({
      where: { id: materiaId },
    });
    if (!materia)
      throw new NotFoundException(`Materia con ID ${materiaId} no encontrada`);

    const periodo = await this.prisma.periodoAcademico.findUnique({
      where: { id: periodoId },
    });
    if (!periodo)
      throw new NotFoundException(`Periodo con ID ${periodoId} no encontrado`);

    const profesor = await this.prisma.perfilProfesor.findUnique({
      where: { id: profesorId },
    });
    if (!profesor)
      throw new NotFoundException(
        `PerfilProfesor con ID ${profesorId} no encontrado`,
      );

    if (!horarios || horarios.length === 0) {
      throw new BadRequestException(
        'El grupo debe tener al menos un horario asignado',
      );
    }

    return this.prisma.grupo.create({
      data: {
        ...rest,
        materiaId,
        periodoId,
        profesorId,
        horarios: {
          create: horarios,
        },
      },
      include: {
        materia: true,
        periodo: true,
        profesor: {
          include: { usuario: { select: { nombre: true, apellido: true } } },
        },
        horarios: true,
      },
    });
  }

  async findAll(periodoId?: number) {
    return this.prisma.grupo.findMany({
      where: periodoId ? { periodoId } : {},
      include: {
        materia: true,
        periodo: true,
        profesor: {
          include: {
            usuario: { select: { nombre: true, apellido: true, email: true } },
          },
        },
        horarios: true,
        _count: {
          select: { detallesInscripcion: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const grupo = await this.prisma.grupo.findUnique({
      where: { id },
      include: {
        materia: true,
        periodo: true,
        profesor: { include: { usuario: true } },
        horarios: true,
        detallesInscripcion: {
          include: {
            inscripcion: {
              include: {
                estudiantePerfil: {
                  include: { usuario: true },
                },
              },
            },
          },
        },
      },
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${id} no encontrado`);
    }

    return grupo;
  }

  async update(id: number, updateGrupoDto: UpdateGrupoDto) {
    await this.findOne(id);
    const { horarios, ...rest } = updateGrupoDto;

    return this.prisma.$transaction(async (tx) => {
      if (horarios) {
        await tx.horarioGrupo.deleteMany({ where: { grupoId: id } });
      }

      return tx.grupo.update({
        where: { id },
        data: {
          ...rest,
          ...(horarios && {
            horarios: {
              create: horarios,
            },
          }),
        },
        include: {
          horarios: true,
          materia: true,
        },
      });
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.grupo.delete({
      where: { id },
    });
  }
}
