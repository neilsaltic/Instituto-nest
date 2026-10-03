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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoUsuario, Rol } from '../../generated/prisma/enums.js'; // Importar desde @prisma/client evita errores de módulo

export class CreateUsuarioDto {
  @ApiProperty({ example: 'estudiante@ejemplo.com' })
  @IsEmail({}, { message: 'El formato de correo no es válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({ example: 'ClaveSegura123!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  nombre: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  apellido: string;

  @ApiProperty({ example: '1234567' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  ci: string;

  @ApiProperty({ example: '2000-05-15' })
  @IsDateString(
    {},
    { message: 'Formato de fecha de nacimiento inválido (YYYY-MM-DD)' },
  )
  @IsNotEmpty()
  fechaNacimiento: string;

  @ApiPropertyOptional({ example: '71234567' })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({
    enum: EstadoUsuario,
    example: EstadoUsuario.PENDIENTE,
  })
  @IsOptional()
  @IsEnum(EstadoUsuario)
  estado?: EstadoUsuario;

  @ApiPropertyOptional({ example: 'Carlos Pérez' })
  @IsOptional()
  @IsString()
  nombreTutor?: string;

  @ApiPropertyOptional({ example: '77712345' })
  @IsOptional()
  @IsString()
  telefonoTutor?: string;
}
