import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { QueryPagoDto } from './dto/query-pago.dto.js';
import { CreatePagoDto } from './dto/create-pago.dto.js';
import { ValidarPagoDto } from './dto/validar-pago-dto.js';
import { WebhookMockPayDto } from './dto/webhook-mockpay.dto.js';
import { EstadoUsuario } from '../generated/prisma/enums.js';

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
            estado: true,
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

  // 1. Registro manual de pagos (Cajeros / Recepcionistas) -> Activa automáticamente al estudiante
  async registrarPago(dto: CreatePagoDto, verificadoPorUsuarioId: number) {
    return await this.prisma.$transaction(async (tx) => {
      const nuevoPago = await tx.pago.create({
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
            select: { id: true, nombre: true, apellido: true, email: true },
          },
        },
      });

      // Activar la cuenta del usuario tras el pago
      await tx.usuario.update({
        where: { id: dto.estudianteUsuarioId },
        data: { estado: EstadoUsuario.ACTIVO },
      });

      return nuevoPago;
    });
  }

  // 2. Crear intención de pago automatizada en MockPay
  async crearIntencionPagoMockPay(dto: CreatePagoDto) {
    const nuevoPago = await this.prisma.pago.create({
      data: {
        estudianteUsuarioId: dto.estudianteUsuarioId,
        concepto: dto.concepto,
        monto: dto.monto,
        metodo: dto.metodo,
        estado: 'PENDIENTE',
      },
    });

    try {
      const response = await fetch(
        'https://api-mock-payment.funvaltech.cloud/api/v1/payments',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.MOCKPAY_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: dto.monto,
            currency: 'USD',
            metadata: {
              order_id: nuevoPago.id.toString(), // Kasapulan para iti MockPay
              pagoId: nuevoPago.id.toString(),
            },
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al comunicarse con MockPay');
      }

      await this.prisma.pago.update({
        where: { id: nuevoPago.id },
        data: { transaccionId: data.id },
      });

      return {
        pagoId: nuevoPago.id,
        checkoutUrl: data.checkout_url,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al procesar el pago con la pasarela MockPay',
      );
    }
  }

  // 3. Procesar respuesta automática del Webhook de MockPay
  async procesarWebhookMockPay(payload: WebhookMockPayDto) {
    // Read order_id, pagoId, or matriculaId safely
    const rawId =
      payload.metadata?.order_id ??
      payload.metadata?.pagoId ??
      payload.metadata?.matriculaId;

    const pagoId = Number(rawId);

    if (!pagoId || isNaN(pagoId)) {
      return {
        received: true,
        note: 'No valid pagoId/order_id found in metadata',
      };
    }

    const pago = await this.prisma.pago.findUnique({
      where: { id: pagoId },
    });

    if (!pago) {
      throw new NotFoundException(`El pago con ID ${pagoId} no fue encontrado`);
    }
    const status = String(
      payload?.status || payload?.event || '',
    ).toUpperCase();
    if (
      status.includes('SUCCEEDED') ||
      status.includes('SUCCESS') ||
      status === 'APROBADO'
    ) {
      await this.prisma.$transaction([
        this.prisma.pago.update({
          where: { id: pagoId },
          data: {
            estado: 'APROBADO',
            fechaVerificacion: new Date(),
          },
        }),
        this.prisma.usuario.update({
          where: { id: pago.estudianteUsuarioId },
          data: { estado: EstadoUsuario.ACTIVO },
        }),
      ]);
    } else if (
      status.includes('FAILED') ||
      status.includes('REJECTED') ||
      status.includes('DECLINED') ||
      status === 'RECHAZADO'
    ) {
      await this.prisma.pago.update({
        where: { id: pagoId },
        data: { estado: 'RECHAZADO' },
      });
    }

    return { received: true };
  }

  // 4. Cambiar / Validar Estado de Pago (Acción manual del Administrador/Recepción)
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

    return await this.prisma.$transaction(async (tx) => {
      const pagoActualizado = await tx.pago.update({
        where: { id: pagoId },
        data: {
          estado: dto.estado,
          verificadoPorUsuarioId,
          fechaVerificacion: new Date(),
        },
      });

      // Si el pago es APROBADO, se activa la cuenta del estudiante
      if (dto.estado === 'APROBADO') {
        await tx.usuario.update({
          where: { id: pago.estudianteUsuarioId },
          data: { estado: EstadoUsuario.ACTIVO },
        });
      }

      return pagoActualizado;
    });
  }

  async verificarMoraEstudiante(usuarioId: number): Promise<boolean> {
    const deudaVencida = await this.prisma.pago.findFirst({
      where: {
        estudianteUsuarioId: usuarioId,
        estado: 'PENDIENTE',
      },
    });

    return !!deudaVencida;
  }
}
