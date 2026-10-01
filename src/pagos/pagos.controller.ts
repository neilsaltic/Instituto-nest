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
} from '@nestjs/common';
import { PagosService } from './pagos.service.js';
import { CreatePagoDto } from './dto/create-pago.dto.js';
import { UpdatePagoDto } from './dto/update-pago.dto.js';
import { QueryPagoDto } from './dto/query-pago.dto.js';
import { ValidarPagoDto } from './dto/validar-pago-dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Get()
  async ObtenerPagos(@Query() query: QueryPagoDto) {
    return this.pagosService.obtenerPagos(query);
  }

  @Post()
  async registrarPago(@Body() dto: CreatePagoDto, @Req() req: any) {
    const receppcionistaId = req.user.id;
    return this.pagosService.registrarPago(dto, receppcionistaId);
  }
  @Patch(':id/validar')
  async cambiarEstadoPago(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ValidarPagoDto,
    @Req() req: any,
  ) {
    const recepcionistaId = req.user.id;
    return this.pagosService.cambiarEstadoPago(id, dto, recepcionistaId);
  }
}
