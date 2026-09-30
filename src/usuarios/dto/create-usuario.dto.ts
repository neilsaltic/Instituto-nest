import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { EstadoUsuario, Rol } from '../../generated/prisma/enums.js';
export class CreateUsuarioDto {
  @IsEmail({}, { message: 'El formato de correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El Email no puede estar Vacio' })
  @Matches(/\S/, {
    message: 'El email no puede contener solo espacios',
  })
  email: string;

  @IsString({ message: 'la contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @IsNotEmpty({ message: 'la contraseña no puede estar Vacia' })
  @Matches(/\S/, {
    message: 'la contraseña no puede contener solo espacios',
  })
  password: string;

  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'el nombre no puede estar vacio' })
  @Matches(/\S/, {
    message: 'el nombre no puede contener solo espacios',
  })
  @MinLength(2, { message: 'el nombre debe tener al menos 2 caracteres' })
  nombre: string;

  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'el apellido no puede estar vacio' })
  @Matches(/\S/, {
    message: 'el apellido no puede contener solo espacios',
  })
  @MinLength(2, { message: 'el apellido debe tener al menos 2 caracteres' })
  apellido: string;

  @IsString({ message: 'El CI debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'el CI no puede estar vacio' })
  @Matches(/\S/, {
    message: 'el CI no puede contener solo espacios',
  })
  @MinLength(5, { message: 'el CI debe tener al menos 5 caracteres' })
  ci: string;

  @IsString({ message: 'La fecha de nacimiento debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La fecha de nacimiento no puede estar vacía' })
  @Matches(/\S/, {
    message: 'La fecha de nacimiento no puede contener solo espacios',
  })
  @IsDateString(
    { strict: true },
    {
      message:
        'La fecha de nacimiento debe tener un formato válido (ej. YYYY-MM-DD)',
    },
  )
  fechaNacimiento: string; // Formato ISO "YYYY-MM-DD"

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @Matches(/\S/, { message: 'El teléfono no puede contener solo espacios' })
  @Matches(/^[0-9+() -]+$/, {
    message:
      'El teléfono solo puede contener números, espacios y caracteres como +, - o ()',
  })
  @MinLength(7, { message: 'El teléfono debe tener al menos 7 caracteres' })
  telefono?: string;

  @IsOptional()
  @IsEnum(Rol, {
    message: `El rol debe ser un valor válido (${Object.values(Rol).join(', ')})`,
  })
  rol?: Rol;

  @IsOptional()
  @IsEnum(EstadoUsuario, {
    message: `El estado debe ser un valor válido (${Object.values(EstadoUsuario).join(', ')})`,
  })
  estado?: EstadoUsuario;
}
