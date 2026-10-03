import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMateriaDto {
  @ApiProperty({
    description: 'Código único de la materia',
    example: 'MAT-101',
  })
  @IsNotEmpty({ message: 'El código de la materia es obligatorio' })
  @IsString({ message: 'El código debe ser una cadena de texto' })
  @Matches(/\S/, { message: 'El código no puede contener solo espacios' })
  codigo: string;

  @ApiProperty({
    description: 'Nombre de la materia',
    example: 'Programación Web Backend',
  })
  @IsNotEmpty({ message: 'El nombre de la materia es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Matches(/\S/, { message: 'El nombre no puede contener solo espacios' })
  nombre: string;

  @ApiProperty({
    description: 'Número de créditos académicos',
    example: 5,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'Los créditos son obligatorios' })
  @IsNumber({}, { message: 'Los créditos deben ser un número' })
  @Min(1, { message: 'Debe tener al menos 1 crédito' })
  @Type(() => Number)
  creditos: number;

  @ApiProperty({
    description: 'Costo de inscripción para la materia',
    example: 150.0,
  })
  @IsNotEmpty({ message: 'El costo de inscripción es obligatorio' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El costo de inscripción debe ser un número decimal válido' },
  )
  @IsPositive({ message: 'El costo de inscripción debe ser mayor a 0' })
  @Type(() => Number)
  costoInscripcion: number;

  @ApiProperty({
    description: 'Costo de mensualidad de la materia',
    example: 300.0,
  })
  @IsNotEmpty({ message: 'El costo de la mensualidad es obligatorio' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El costo de la mensualidad debe ser un número decimal válido' },
  )
  @IsPositive({ message: 'El costo de la mensualidad debe ser mayor a 0' })
  @Type(() => Number)
  costoMensualidad: number;
}
