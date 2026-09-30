import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Rol, EstadoUsuario } from '../../generated/prisma/client.js';

export class RegisterUserDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @Matches(/\S/, {
    message: 'El nombre no puede contener solo espacios',
  })
  nombre: string;

  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @Matches(/\S/, {
    message: 'El apellido no puede contener solo espacios',
  })
  apellido: string;

  @IsString({ message: 'El CI debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El CI es obligatorio' })
  ci: string;

  @IsEmail({}, { message: 'El email debe estar en el formato correcto' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @IsString({ message: 'El password debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El password es obligatorio' })
  @MinLength(6, { message: 'El password debe tener al menos 6 caracteres' })
  @Matches(/\S/, {
    message: 'El password no puede contener solo espacios',
  })
  password: string;

  @IsString({
    message: 'La fecha de nacimiento debe ser una cadena de texto (YYYY-MM-DD)',
  })
  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
  fechaNacimiento: string;

  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsOptional()
  telefono?: string;

  @IsEnum(Rol, { message: 'El rol asignado no es válido' })
  @IsOptional()
  rol?: Rol;

  @IsEnum(EstadoUsuario, { message: 'El estado no es válido' })
  @IsOptional()
  estado?: EstadoUsuario;
}
