import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { QueryPagoDto } from './dto/query-pago.dto.js';
import { CreatePagoDto } from './dto/create-pago.dto.js';
import { ValidarPagoDto } from './dto/validar-pago-dto.js';

@Injectable()
export class PagosService {
  constructor(private prisma: PrismaService) {}

  async obtenerPagos(query: QueryPagoDto) {
    const { estudiantePerfilId, estado } = query;

    return await this.prisma.pago.findMany({
      where: {
        ...(estado && { estado }),
        ...(estudiantePerfilId && { estudianteUsuarioId: estudiantePerfilId }),
      },
      include: {
        estudianteUsuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        verificadoPor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }
  async registrarPago(dto: CreatePagoDto, verificadoPorUsuarioId: number) {
    return await this.prisma.pago.create({
      data: {
        estudianteUsuarioId: dto.estudianteUsuarioId,
        concepto: dto.concepto,
        monto: dto.monto,
        metodo: dto.metodo,
        estado: 'APROBADO',
        verificadoPorUsuarioId,
        fechaVerificacion: new Date(),
      },
      include: {
        estudianteUsuario: {
          select: { nombre: true, apellido: true, email: true },
        },
      },
    });
  }
  async cambiarEstadoPago(
    pagoId: number,
    dto: ValidarPagoDto,
    verificadoPorUsuarioId: number,
  ) {
    const pago = await this.prisma.pago.findUnique({
      where: { id: pagoId },
    });

    if (!pago) {
      throw new NotFoundException('El registro de pago no existe.');
    }

    return await this.prisma.pago.update({
      where: { id: pagoId },
      data: {
        estado: dto.estado,
        verificadoPorUsuarioId,
        fechaVerificacion: new Date(),
      },
    });
  }
  async verificarMoraEstudiante(usuarioId: number): Promise<boolean> {
    const ahora = new Date();

    const deudaVencida = await this.prisma.pago.findFirst({
      where: {
        estudianteUsuarioId: usuarioId,
        estado: 'PENDIENTE',
      },
    });

    return !!deudaVencida;
  }
}
