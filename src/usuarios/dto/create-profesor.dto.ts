import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoUsuario } from '../../generated/prisma/enums.js';

export class CreateProfesorDto {
  @ApiProperty({ example: 'profesor@ejemplo.com' })
  @IsEmail({}, { message: 'El formato de correo no es válido' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'ClaveSegura123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'Roberto' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  nombre: string;

  @ApiProperty({ example: 'Gómez' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  apellido: string;

  @ApiProperty({ example: '7654321' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  ci: string;

  @ApiProperty({ example: '1985-08-20' })
  @IsDateString()
  @IsNotEmpty()
  fechaNacimiento: string;

  @ApiPropertyOptional({ example: '71234567' })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({ enum: EstadoUsuario, example: EstadoUsuario.ACTIVO })
  @IsOptional()
  @IsEnum(EstadoUsuario)
  estado?: EstadoUsuario;

  @ApiProperty({ example: 'Ingeniería de Software' })
  @IsString()
  @IsNotEmpty({ message: 'La especialidad es requerida para un profesor' })
  especialidad: string;

  @ApiPropertyOptional({ example: '2026-02-01' })
  @IsOptional()
  @IsDateString()
  fechaContratacion?: string;
}
