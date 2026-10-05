import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PagosService } from './pagos.service.js';
import { CreatePagoDto } from './dto/create-pago.dto.js';
import { UpdatePagoDto } from './dto/update-pago.dto.js';
import { QueryPagoDto } from './dto/query-pago.dto.js';
import { ValidarPagoDto } from './dto/validar-pago-dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorators.js';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { WebhookMockPayDto } from './dto/webhook-mockpay.dto.js';

@ApiTags('Pagos')
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @ApiOperation({ summary: 'Obtener lista de pagos (Solo Recepcionista)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de pagos obtenida exitosamente.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido para este rol.' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RECEPCIONISTA')
  @Get()
  async ObtenerPagos(@Query() query: QueryPagoDto) {
    return this.pagosService.obtenerPagos(query);
  }

  @ApiOperation({
    summary: 'Registrar pago manual en caja (Solo Recepcionista)',
  })
  @ApiResponse({
    status: 201,
    description: 'Pago registrado exitosamente como APROBADO.',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido para este rol.' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RECEPCIONISTA')
  @Post()
  async registrarPago(@Body() dto: CreatePagoDto, @Req() req: any) {
    const receppcionistaId = req.user.id;
    return this.pagosService.registrarPago(dto, receppcionistaId);
  }

  @ApiOperation({
    summary: 'Validar o cambiar estado de un pago (Solo Recepcionista)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del pago a actualizar',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del pago actualizado correctamente.',
  })
  @ApiResponse({ status: 404, description: 'El registro de pago no existe.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RECEPCIONISTA')
  @Patch(':id/validar')
  async cambiarEstadoPago(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ValidarPagoDto,
    @Req() req: any,
  ) {
    const recepcionistaId = req.user.id;
    return this.pagosService.cambiarEstadoPago(id, dto, recepcionistaId);
  }

  @ApiOperation({
    summary: 'Generar link de checkout de MockPay para el estudiante',
  })
  @ApiResponse({
    status: 201,
    description:
      'Intención de pago registrada. Devuelve la URL de redirección a la pasarela.',
  })
  @ApiResponse({ status: 400, description: 'Datos del pago inválidos.' })
  @ApiResponse({
    status: 500,
    description: 'Error al comunicarse con la pasarela de pagos.',
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('crear-intencion')
  crearIntencionPago(@Body() dto: CreatePagoDto) {
    return this.pagosService.crearIntencionPagoMockPay(dto);
  }

  @ApiOperation({
    summary: 'Webhook público para recibir notificaciones de MockPay',
  })
  @ApiResponse({
    status: 200,
    description: 'Notificación procesada correctamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Pago no encontrado en el sistema.',
  })
  @HttpCode(HttpStatus.OK)
  @Post('webhook')
  procesarWebhook(@Body() payload: WebhookMockPayDto) {
    return this.pagosService.procesarWebhookMockPay(payload);
  }
}
