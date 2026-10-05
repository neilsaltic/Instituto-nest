import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PeriodosService } from './periodos.service.js';
import { CreatePeriodoDto } from './dto/create-periodo.dto.js';
import { UpdatePeriodoDto } from './dto/update-periodo.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorators.js';
import { Rol } from '../generated/prisma/enums.js';

@ApiTags('Periodos Académicos')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('periodos')
export class PeriodosController {
  constructor(private readonly periodosService: PeriodosService) {}

  @Post()
  @Roles(Rol.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear periodo académico (Solo Admin)' })
  create(@Body() createPeriodoDto: CreatePeriodoDto) {
    return this.periodosService.create(createPeriodoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los periodos' })
  findAll() {
    return this.periodosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un periodo por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.periodosService.findOne(id);
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar un periodo (Solo Admin)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePeriodoDto: UpdatePeriodoDto,
  ) {
    return this.periodosService.update(id, updatePeriodoDto);
  }

  @Delete(':id')
  @Roles(Rol.ADMINISTRADOR)
  @ApiOperation({ summary: 'Eliminar un periodo (Solo Admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.periodosService.remove(id);
  }
}
