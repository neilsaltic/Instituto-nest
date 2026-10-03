import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoPago } from '../../generated/prisma/enums.js';

export class QueryPagoDto {
  @ApiPropertyOptional({
    description: 'Filtrar pagos por el ID del estudiante',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  estudiantePerfilId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar pagos por su estado actual',
    enum: EstadoPago,
    example: EstadoPago.PENDIENTE,
  })
  @IsOptional()
  @IsEnum(EstadoPago, {
    message: 'El estado debe ser PENDIENTE, APROBADO o RECHAZADO.',
  })
  estado?: EstadoPago;
}
