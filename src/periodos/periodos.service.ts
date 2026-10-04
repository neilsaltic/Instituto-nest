import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePeriodoDto } from './dto/create-periodo.dto.js';
import { UpdatePeriodoDto } from './dto/update-periodo.dto.js';

@Injectable()
export class PeriodosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPeriodoDto: CreatePeriodoDto) {
    if (
      new Date(createPeriodoDto.fechaInicio) >=
      new Date(createPeriodoDto.fechaFin)
    ) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la fecha de fin',
      );
    }

    return this.prisma.periodoAcademico.create({
      data: {
        ...createPeriodoDto,
        fechaInicio: new Date(createPeriodoDto.fechaInicio),
        fechaFin: new Date(createPeriodoDto.fechaFin),
      },
    });
  }

  async findAll() {
    return this.prisma.periodoAcademico.findMany({
      orderBy: { fechaInicio: 'desc' },
      include: {
        _count: {
          select: { grupos: true, inscripciones: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const periodo = await this.prisma.periodoAcademico.findUnique({
      where: { id },
      include: {
        grupos: {
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
      },
    });

    if (!periodo) {
      throw new NotFoundException(
        `Periodo académico con ID ${id} no encontrado`,
      );
    }

    return periodo;
  }

  async update(id: number, updatePeriodoDto: UpdatePeriodoDto) {
    await this.findOne(id);

    const data: any = { ...updatePeriodoDto };
    if (updatePeriodoDto.fechaInicio)
      data.fechaInicio = new Date(updatePeriodoDto.fechaInicio);
    if (updatePeriodoDto.fechaFin)
      data.fechaFin = new Date(updatePeriodoDto.fechaFin);

    return this.prisma.periodoAcademico.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.periodoAcademico.delete({
      where: { id },
    });
  }
}
