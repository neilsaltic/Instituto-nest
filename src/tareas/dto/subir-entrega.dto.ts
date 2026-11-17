import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubirEntregaDto {
  @ApiProperty({
    description:
      'Campo obsoleto. El estudiante se obtiene del token JWT y no es necesario enviarlo',
    example: 1,
    type: Number,
    deprecated: true,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  estudiantePerfilId?: number;

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
