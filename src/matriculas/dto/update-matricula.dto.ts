import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMatriculaDto {
  @IsNotEmpty({ message: 'El ID del nuevo grupo es obligatorio.' })
  @IsInt({ message: 'El ID del nuevo grupo debe ser un número entero.' })
  @IsPositive({ message: 'El ID del nuevo grupo debe ser un número positivo.' })
  @Type(() => Number)
  nuevoGrupoId: number;
}
