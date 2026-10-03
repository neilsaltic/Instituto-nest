import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubirEntregaDto {
  @ApiProperty({
    description: 'ID del perfil del estudiante que realiza la entrega',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'El ID del estudiante es obligatorio.' })
  @IsInt()
  @Type(() => Number)
  estudiantePerfilId: number;

  @ApiProperty({
    description: 'ID de la tarea a la cual pertenece la entrega',
    example: 5,
    type: Number,
  })
  @IsNotEmpty({ message: 'El ID de la tarea es obligatorio.' })
  @IsInt()
  @Type(() => Number)
  tareaId: number;

  @ApiPropertyOptional({
    description: 'Texto, observaciones o respuesta escrita de la entrega',
    example:
      'Adjunto el enlace a mi repositorio de GitHub con el código desarrollado.',
    type: String,
  })
  @IsOptional()
  @IsString()
  contenidoTexto?: string;

  @ApiPropertyOptional({
    description:
      'URL del archivo subido (Google Drive, Supabase Storage, etc.)',
    example: 'https://supabase.co/storage/v1/object/public/entregas/tarea1.pdf',
    type: String,
  })
  @IsOptional()
  @IsString()
  archivoUrl?: string;
}
