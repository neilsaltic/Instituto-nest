import { IsNotEmpty, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CalificarEntregaDto {
  @IsNotEmpty({ message: 'La calificación es obligatoria.' })
  @IsNumber()
  @Min(0, { message: 'La calificación mínima es 0.' })
  @Max(100, { message: 'La calificación máxima es 100.' })
  @Type(() => Number)
  calificacion: number;
}
