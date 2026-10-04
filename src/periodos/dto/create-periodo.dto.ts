import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreatePeriodoDto {
  @ApiProperty({
    description:
      'Nombre o código identificador del periodo académico (ej. semestre/año)',
    example: '2026-I',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del periodo es obligatorio' })
  nombre: string;

  @ApiProperty({
    description: 'Fecha de inicio del periodo en formato ISO (YYYY-MM-DD)',
    example: '2026-02-01',
  })
  @IsDateString(
    {},
    {
      message:
        'La fechaInicio debe ser una fecha válida en formato ISO (YYYY-MM-DD)',
    },
  )
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  fechaInicio: string;

  @ApiProperty({
    description:
      'Fecha de finalización del periodo en formato ISO (YYYY-MM-DD)',
    example: '2026-06-30',
  })
  @IsDateString(
    {},
    {
      message:
        'La fechaFin debe ser una fecha válida en formato ISO (YYYY-MM-DD)',
    },
  )
  @IsNotEmpty({ message: 'La fecha de fin es obligatoria' })
  fechaFin: string;

  @ApiProperty({
    description:
      'Límite máximo de créditos que un estudiante puede matricular en este periodo',
    example: 25,
    minimum: 1,
  })
  @IsInt({ message: 'El límite de créditos debe ser un número entero' })
  @Min(1, { message: 'El límite de créditos debe ser de al menos 1 crédito' })
  limiteCreditos: number;

  @ApiProperty({
    description: 'Estado operativo del periodo académico',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean({
    message: 'El campo activo debe ser un valor booleano (true/false)',
  })
  @IsOptional()
  activo?: boolean;
}
