import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoPago } from '../../generated/prisma/enums.js';

export class ValidarPagoDto {
  @ApiProperty({
    description: 'Nuevo estado que se asignará al pago',
    enum: EstadoPago,
    example: EstadoPago.APROBADO,
  })
  @IsNotEmpty({ message: 'Debe especificar el nuevo estado.' })
  @IsEnum(EstadoPago)
  estado: EstadoPago;

  @ApiPropertyOptional({
    description: 'Observación o motivo del cambio de estado (opcional)',
    example: 'Comprobante de transferencia bancaria verificado en cuenta.',
    type: String,
  })
  @IsOptional()
  @IsString()
  observacion?: string;
}
