import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConceptoPago, MetodoPago } from '../../generated/prisma/enums.js';

export class CreatePagoDto {
  @ApiProperty({
    description: 'ID del estudiante al que pertenece el pago',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'El ID del estudiante es obligatorio.' })
  @IsInt()
  @Type(() => Number)
  estudianteUsuarioId: number;

  @ApiProperty({
    description: 'Concepto o razón del pago',
    enum: ConceptoPago,
    example: ConceptoPago.MENSUALIDAD,
  })
  @IsNotEmpty({ message: 'El concepto de pago es obligatorio.' })
  @IsEnum(ConceptoPago, {
    message: 'El concepto debe ser INSCRIPCION, MENSUALIDAD u OTRO.',
  })
  concepto: ConceptoPago;

  @ApiProperty({
    description: 'Monto a pagar en la transacción',
    example: 150.5,
    type: Number,
  })
  @IsNotEmpty({ message: 'El monto es obligatorio.' })
  @IsNumber()
  @IsPositive({ message: 'El monto debe ser un número positivo.' })
  @Type(() => Number)
  monto: number;

  @ApiPropertyOptional({
    description: 'Método utilizado para realizar el pago',
    enum: MetodoPago,
    example: MetodoPago.PASARELA_ONLINE,
  })
  @IsOptional()
  @IsEnum(MetodoPago, {
    message:
      'Selecciona un método válido (EFECTIVO, TRANSFERENCIA, TARJETA, QR).',
  })
  metodo: MetodoPago;
}
