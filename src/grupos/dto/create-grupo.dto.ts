import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateHorarioDto } from './create-horario.dto.js';

export class CreateGrupoDto {
  @ApiProperty({
    description: 'ID de la materia a la cual pertenece este grupo',
    example: 1,
  })
  @IsInt({ message: 'El materiaId debe ser un número entero' })
  @IsNotEmpty({ message: 'El materiaId es obligatorio' })
  materiaId: number;

  @ApiProperty({
    description: 'ID del periodo académico en el cual se imparte el grupo',
    example: 1,
  })
  @IsInt({ message: 'El periodoId debe ser un número entero' })
  @IsNotEmpty({ message: 'El periodoId es obligatorio' })
  periodoId: number;

  @ApiProperty({
    description: 'ID del perfil del profesor asignado (PerfilProfesor)',
    example: 1,
  })
  @IsInt({ message: 'El profesorId debe ser un número entero' })
  @IsNotEmpty({ message: 'El profesorId es obligatorio' })
  profesorId: number;

  @ApiProperty({
    description: 'Identificador o nombre asignado al grupo / aula',
    example: 'Grupo A',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del grupo es obligatorio' })
  nombre: string;

  @ApiProperty({
    description:
      'Límite máximo de estudiantes permitidos en la capacidad del aula',
    example: 30,
    minimum: 1,
  })
  @IsInt({ message: 'El cupo máximo debe ser un número entero' })
  @Min(1, { message: 'El cupo máximo debe ser de al menos 1 estudiante' })
  cupoMaximo: number;

  @ApiProperty({
    description: 'Lista de los bloques de horarios asignados al grupo',
    type: [CreateHorarioDto],
    example: [
      {
        diaSemana: 'LUNES',
        horaInicio: '08:00',
        horaFin: '10:00',
      },
      {
        diaSemana: 'MIERCOLES',
        horaInicio: '08:00',
        horaFin: '10:00',
      },
    ],
  })
  @IsArray({ message: 'Los horarios deben enviarse como una lista' })
  @ValidateNested({ each: true })
  @Type(() => CreateHorarioDto)
  horarios: CreateHorarioDto[];
}
