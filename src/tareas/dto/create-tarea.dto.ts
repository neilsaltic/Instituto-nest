import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTareaDto {
  @ApiProperty({
    description: 'ID del grupo al que se asigna la tarea',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'El ID del grupo es obligatorio.' })
  @IsInt()
  @Type(() => Number)
  grupoId: number;

  @ApiProperty({
    description: 'Título descriptivo de la tarea',
    example: 'Proyecto Final - Módulo 1',
    type: String,
  })
  @IsNotEmpty({ message: 'El título es obligatorio.' })
  @IsString()
  titulo: string;

  @ApiProperty({
    description: 'Descripción detallada de la tarea e instrucciones',
    example:
      'Implementar una API RESTful utilizando NestJS, Prisma y Postgres.',
    type: String,
  })
  @IsNotEmpty({ message: 'La descripción es obligatoria.' })
  @IsString()
  descripcion: string;

  @ApiProperty({
    description: 'Fecha y hora límite de entrega en formato ISO8601',
    example: '2026-10-15T23:59:59.000Z',
    type: String,
  })
  @IsNotEmpty({ message: 'La fecha límite es obligatoria.' })
  @IsDateString({}, { message: 'La fecha límite debe ser ISO8601.' })
  fechaLimite: string;
}
