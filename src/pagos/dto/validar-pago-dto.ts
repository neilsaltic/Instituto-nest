import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EstadoPago } from '../../generated/prisma/enums.js';

export class ValidarPagoDto {
  @IsNotEmpty({ message: 'Debe especificar el nuevo estado.' })
  @IsEnum(EstadoPago)
  estado: EstadoPago;

  @IsOptional()
  @IsString()
  observacion?: string;
}
