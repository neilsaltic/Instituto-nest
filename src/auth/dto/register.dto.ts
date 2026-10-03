import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Rol, EstadoUsuario } from '../../generated/prisma/client.js';

export class RegisterUserDto {
  @ApiProperty({
    description: 'Nombre(s) del usuario',
    example: 'Carlos',
    minLength: 2,
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @Matches(/\S/, {
    message: 'El nombre no puede contener solo espacios',
  })
  nombre: string;

  @ApiProperty({
    description: 'Apellido(s) del usuario',
    example: 'Mendoza',
    minLength: 2,
  })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @Matches(/\S/, {
    message: 'El apellido no puede contener solo espacios',
  })
  apellido: string;

  @ApiProperty({
    description: 'Cédula de Identidad o documento de identificación',
    example: '8765432',
  })
  @IsString({ message: 'El CI debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El CI es obligatorio' })
  ci: string;

  @ApiProperty({
    description: 'Correo electrónico único para el registro',
    example: 'carlos.mendoza@ejemplo.com',
  })
  @IsEmail({}, { message: 'El email debe estar en el formato correcto' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @ApiProperty({
    description: 'Contraseña de acceso (mínimo 6 caracteres)',
    example: 'ClaveSegura123!',
    minLength: 6,
  })
  @IsString({ message: 'El password debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El password es obligatorio' })
  @MinLength(6, { message: 'El password debe tener al menos 6 caracteres' })
  @Matches(/\S/, {
    message: 'El password no puede contener solo espacios',
  })
  password: string;

  @ApiProperty({
    description: 'Fecha de nacimiento en formato ISO (YYYY-MM-DD)',
    example: '1998-04-20',
  })
  @IsString({
    message: 'La fecha de nacimiento debe ser una cadena de texto (YYYY-MM-DD)',
  })
  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
  fechaNacimiento: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono de contacto',
    example: '76543210',
  })
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Rol inicial del usuario en el sistema',
    enum: Rol,
    example: Rol.ESTUDIANTE,
  })
  @IsEnum(Rol, { message: 'El rol asignado no es válido' })
  @IsOptional()
  rol?: Rol;

  @ApiPropertyOptional({
    description: 'Estado inicial de la cuenta del usuario',
    enum: EstadoUsuario,
    example: EstadoUsuario.PENDIENTE,
  })
  @IsEnum(EstadoUsuario, { message: 'El estado no es válido' })
  @IsOptional()
  estado?: EstadoUsuario;
}
