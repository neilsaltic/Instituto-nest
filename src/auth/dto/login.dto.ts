import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El email debe estar en el formato correcto' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @IsString({ message: 'Password debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'Password es obligatorio' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @Matches(/\S/, {
    message: 'La contraseña no puede contener solo espacios',
  })
  password: string;
}
