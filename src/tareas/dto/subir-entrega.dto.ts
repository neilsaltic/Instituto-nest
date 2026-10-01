import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubirEntregaDto {
  @IsNotEmpty({ message: 'El ID del estudiante es obligatorio.' })
  @IsInt()
  @Type(() => Number)
  estudiantePerfilId: number;

  @IsNotEmpty({ message: 'El ID de la tarea es obligatorio.' })
  @IsInt()
  @Type(() => Number)
  tareaId: number;

  @IsOptional()
  @IsString()
  contenidoTexto?: string;

  @IsOptional()
  @IsString()
  archivoUrl?: string;
}
