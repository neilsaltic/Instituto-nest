import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateTareaDto {
  @IsNotEmpty({ message: 'El ID del grupo es obligatorio.' })
  @IsInt()
  @Type(() => Number)
  grupoId: number;

  @IsNotEmpty({ message: 'El título es obligatorio.' })
  @IsString()
  titulo: string;

  @IsNotEmpty({ message: 'La descripción es obligatoria.' })
  @IsString()
  descripcion: string;

  @IsNotEmpty({ message: 'La fecha límite es obligatoria.' })
  @IsDateString({}, { message: 'La fecha límite debe ser ISO8601.' })
  fechaLimite: string;
}
