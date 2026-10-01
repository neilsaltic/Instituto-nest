import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMatriculaDto {
  @IsNotEmpty({ message: 'El ID del perfil del estudiante es obligatorio.' })
  @IsInt({ message: 'El ID del estudiante debe ser un número entero.' })
  @IsPositive({ message: 'El ID del estudiante debe ser un número positivo.' })
  @Type(() => Number) // Parsea strings a number automáticamente (útil si viene por Query/Params/Body)
  estudiantePerfilId: number;

  @IsNotEmpty({ message: 'El ID del grupo es obligatorio.' })
  @IsInt({ message: 'El ID del grupo debe ser un número entero.' })
  @IsPositive({ message: 'El ID del grupo debe ser un número positivo.' })
  @Type(() => Number)
  grupoId: number;
}
