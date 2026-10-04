import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { GruposService } from './grupos.service.js';
import { CreateGrupoDto } from './dto/create-grupo.dto.js';
import { UpdateGrupoDto } from './dto/update-grupo.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorators.js';

@ApiTags('Grupos y Horarios')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('grupos')
export class GruposController {
  constructor(private readonly gruposService: GruposService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Crear un nuevo grupo con sus horarios (Solo Administrador)',
  })
  create(@Body() createGrupoDto: CreateGrupoDto) {
    return this.gruposService.create(createGrupoDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos los grupos (filtrado opcional por periodo)',
  })
  @ApiQuery({ name: 'periodoId', required: false, type: Number })
  findAll(@Query('periodoId') periodoId?: string) {
    return this.gruposService.findAll(periodoId ? +periodoId : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un grupo' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gruposService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Actualizar un grupo y sus horarios (Solo Administrador)',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGrupoDto: UpdateGrupoDto,
  ) {
    return this.gruposService.update(id, updateGrupoDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar un grupo (Solo Administrador)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gruposService.remove(id);
  }
}
