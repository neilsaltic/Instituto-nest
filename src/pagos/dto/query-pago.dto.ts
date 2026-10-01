import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { EstadoPago } from '../../generated/prisma/enums.js';

export class QueryPagoDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  estudiantePerfilId?: number;

  @IsOptional()
  @IsEnum(EstadoPago, {
    message: 'El estado debe ser PENDIENTE, APROBADO o RECHAZADO.',
  })
  estado?: EstadoPago;
}
