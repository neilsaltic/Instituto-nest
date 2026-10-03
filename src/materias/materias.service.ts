import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMateriaDto } from './dto/create-materia.dto.js';
import { UpdateMateriaDto } from './dto/update-materia.dto.js';

@Injectable()
export class MateriasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMateriaDto) {
    const existeCodigo = await this.prisma.materia.findUnique({
      where: { codigo: dto.codigo },
    });

    if (existeCodigo) {
      throw new ConflictException(
        `Ya existe una materia registrada con el código '${dto.codigo}'`,
      );
    }

    return this.prisma.materia.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.materia.findMany({
      include: {
        _count: {
          select: { grupos: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const materia = await this.prisma.materia.findUnique({
      where: { id },
      include: {
        grupos: {
          select: {
            id: true,
            nombre: true,
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

    if (!materia) {
      throw new NotFoundException(`La materia con ID ${id} no existe`);
    }

    return materia;
  }

  async update(id: number, dto: UpdateMateriaDto) {
    await this.findOne(id);

    if (dto.codigo) {
      const codigoExistente = await this.prisma.materia.findFirst({
        where: {
          codigo: dto.codigo,
          NOT: { id },
        },
      });

      if (codigoExistente) {
        throw new ConflictException(
          `El código '${dto.codigo}' ya está asignado a otra materia`,
        );
      }
    }

    return this.prisma.materia.update({
      where: { id },
      data: dto,
    });
  }

  async obtenerProfesoresPorMateria(materiaId: number) {
    const materia = await this.prisma.materia.findUnique({
      where: { id: materiaId },
      include: {
        grupos: {
          include: {
            profesor: {
              include: {
                usuario: {
                  select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    email: true,
                    telefono: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!materia) {
      throw new NotFoundException(`La materia con ID ${materiaId} no existe`);
    }

    const profesoresMap = new Map();

    materia.grupos.forEach((grupo) => {
      const prof = grupo.profesor;
      if (prof && !profesoresMap.has(prof.id)) {
        profesoresMap.set(prof.id, {
          profesorId: prof.id,
          especialidad: prof.especialidad,
          nombre: prof.usuario.nombre,
          apellido: prof.usuario.apellido,
          email: prof.usuario.email,
          telefono: prof.usuario.telefono,
          gruposImpartidos: [grupo.nombre],
        });
      } else if (prof && profesoresMap.has(prof.id)) {
        profesoresMap.get(prof.id).gruposImpartidos.push(grupo.nombre);
      }
    });

    return {
      materiaId: materia.id,
      codigoMateria: materia.codigo,
      nombreMateria: materia.nombre,
      profesores: Array.from(profesoresMap.values()),
    };
  }
}
