import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MetadataMockPayDto {
  @ApiPropertyOptional({
    description: 'ID de la orden o pago enviado a MockPay',
    example: '12',
  })
  @IsOptional()
  @IsString({ message: 'El order_id debe ser una cadena de texto' })
  order_id?: string;

  @ApiPropertyOptional({
    description: 'ID del registro de pago interno generado en el sistema',
    example: '12',
  })
  @IsOptional()
  @IsString({ message: 'El pagoId debe ser una cadena de texto' })
  pagoId?: string;

  @ApiPropertyOptional({
    description:
      'ID de la matrícula asociada si el pago aplica directamente a una inscripción',
    example: '5',
  })
  @IsOptional()
  @IsString({ message: 'El matriculaId debe ser una cadena de texto' })
  matriculaId?: string;
}

export class WebhookMockPayDto {
  @ApiProperty({
    description: 'Nombre del evento notificado por la pasarela',
    example: 'payment.succeeded',
  })
  @IsString({ message: 'El evento debe ser una cadena de texto' })
  event: string;

  @ApiProperty({
    description: 'Identificador único de la transacción en MockPay',
    example: 'pay_mck_9f8d7c6b5a',
  })
  @IsString({ message: 'El ID de la transacción debe ser una cadena de texto' })
  id: string;

  @ApiProperty({
    description: 'Monto total procesado en la transacción',
    example: 150.5,
  })
  @IsNumber({}, { message: 'El monto debe ser un número válido' })
  @IsPositive({ message: 'El monto debe ser un valor positivo' })
  amount: number;

  @ApiProperty({
    description: 'Código ISO de la moneda utilizada',
    example: 'USD',
  })
  @IsString({ message: 'La moneda debe ser una cadena de texto' })
  currency: string;

  @ApiProperty({
    description: 'Estado final del procesamiento del pago en MockPay',
    enum: ['SUCCEEDED', 'FAILED'],
    example: 'SUCCEEDED',
  })
  @IsEnum(['SUCCEEDED', 'FAILED'], {
    message: 'El estado solo puede ser SUCCEEDED o FAILED',
  })
  status: 'SUCCEEDED' | 'FAILED';

  @ApiPropertyOptional({
    description:
      'Razón del rechazo del pago en caso de que el status sea FAILED',
    example: 'insufficient_funds',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'La razón del fallo debe ser una cadena de texto' })
  failure_reason?: string | null;

  @ApiPropertyOptional({
    description:
      'Metadatos adicionales vinculados al pago para trazabilidad en tu backend',
    type: () => MetadataMockPayDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataMockPayDto)
  metadata?: MetadataMockPayDto;
}
