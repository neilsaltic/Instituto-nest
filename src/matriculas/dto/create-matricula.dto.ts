import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMatriculaDto {
  @ApiProperty({
    description: 'ID del perfil del estudiante que se va a matricular',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del perfil del estudiante es obligatorio.' })
  @IsInt({ message: 'El ID del estudiante debe ser un número entero.' })
  @IsPositive({ message: 'El ID del estudiante debe ser un número positivo.' })
  @Type(() => Number)
  estudiantePerfilId: number;

  @ApiProperty({
    description: 'ID del grupo en el cual se inscribirá el estudiante',
    example: 2,
  })
  @IsNotEmpty({ message: 'El ID del grupo es obligatorio.' })
  @IsInt({ message: 'El ID del grupo debe ser un número entero.' })
  @IsPositive({ message: 'El ID del grupo debe ser un número positivo.' })
  @Type(() => Number)
  grupoId: number;
}
