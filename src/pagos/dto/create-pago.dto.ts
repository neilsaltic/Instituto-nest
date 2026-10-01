import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { ConceptoPago, MetodoPago } from '../../generated/prisma/enums.js';

export class CreatePagoDto {
  @IsNotEmpty({ message: 'El ID del estudiante es obligatorio.' })
  @IsInt()
  @Type(() => Number)
  estudianteUsuarioId: number;

  @IsNotEmpty({ message: 'El concepto de pago es obligatorio.' })
  @IsEnum(ConceptoPago, {
    message: 'El concepto debe ser INSCRIPCION, MENSUALIDAD u OTRO.',
  })
  concepto: ConceptoPago;

  @IsNotEmpty({ message: 'El monto es obligatorio.' })
  @IsNumber()
  @IsPositive({ message: 'El monto debe ser un número positivo.' })
  @Type(() => Number)
  monto: number;

  @IsNotEmpty({ message: 'El método de pago es obligatorio.' })
  @IsEnum(MetodoPago, {
    message:
      'Selecciona un método válido (EFECTIVO, TRANSFERENCIA, TARJETA, QR).',
  })
  metodo: MetodoPago;
}
