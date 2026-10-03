import { IsNotEmpty, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CalificarEntregaDto {
  @ApiProperty({
    description:
      'Calificación asignada a la entrega del estudiante (entre 0 y 100)',
    example: 95,
    minimum: 0,
    maximum: 100,
    type: Number,
  })
  @IsNotEmpty({ message: 'La calificación es obligatoria.' })
  @IsNumber()
  @Min(0, { message: 'La calificación mínima es 0.' })
  @Max(100, { message: 'La calificación máxima es 100.' })
  @Type(() => Number)
  calificacion: number;
}
