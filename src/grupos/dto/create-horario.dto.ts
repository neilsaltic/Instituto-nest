import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';
import { DiaSemana } from '../../generated/prisma/enums.js';

export class CreateHorarioDto {
  @ApiProperty({
    description: 'Día de la semana en que se dicta la clase',
    enum: DiaSemana,
    example: DiaSemana.LUNES,
  })
  @IsEnum(DiaSemana, {
    message:
      'El día de la semana debe ser un día laboral válido (LUNES a VIERNES)',
  })
  diaSemana: DiaSemana;

  @ApiProperty({
    description: 'Hora de inicio en formato de 24 horas (HH:mm)',
    example: '08:00',
  })
  @IsString()
  @IsNotEmpty({ message: 'La hora de inicio es obligatoria' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message:
      'La horaInicio debe tener un formato válido de 24 horas (ej. 08:00 o 14:30)',
  })
  horaInicio: string;

  @ApiProperty({
    description: 'Hora de finalización en formato de 24 horas (HH:mm)',
    example: '10:00',
  })
  @IsString()
  @IsNotEmpty({ message: 'La hora de fin es obligatoria' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message:
      'La horaFin debe tener un formato válido de 24 horas (ej. 10:00 o 16:30)',
  })
  horaFin: string;
}
