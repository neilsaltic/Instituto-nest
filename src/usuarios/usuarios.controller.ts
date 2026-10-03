import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { CreateProfesorDto } from './dto/create-profesor.dto.js';
import { UpdateProfesorDto } from './dto/update-profesor.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorators.js';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // --- ESTUDIANTES ---
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RECEPCIONISTA', 'ADMINISTRADOR')
  @Post('estudiantes')
  @ApiOperation({ summary: 'Registrar un nuevo estudiante' })
  async createEstudiante(@Body() dto: CreateUsuarioDto) {
    return await this.usuariosService.createEstudiante(dto);
  }
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RECEPCIONISTA', 'ADMINISTRADOR')
  @Get('estudiantes')
  @ApiOperation({ summary: 'Listar todos los estudiantes' })
  async findAllEstudiantes() {
    return await this.usuariosService.findAllEstudiantes();
  }
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RECEPCIONISTA', 'ADMINISTRADOR')
  @Get('estudiantes/:id')
  @ApiOperation({ summary: 'Obtener un estudiante por ID con su perfil' })
  async findOneEstudiante(@Param('id', ParseIntPipe) id: number) {
    return await this.usuariosService.findOneEstudiante(id);
  }
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RECEPCIONISTA', 'ADMINISTRADOR')
  @Patch('estudiantes/:id')
  @ApiOperation({ summary: 'Actualizar un estudiante y su perfil' })
  async updateEstudiante(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsuarioDto,
  ) {
    return await this.usuariosService.updateEstudiante(id, dto);
  }

  // --- PROFESORES ---
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  @Post('profesores')
  @ApiOperation({ summary: 'Registrar un nuevo profesor' })
  async createProfesor(@Body() dto: CreateProfesorDto) {
    return await this.usuariosService.createProfesor(dto);
  }
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  @Get('profesores')
  @ApiOperation({ summary: 'Listar todos los profesores' })
  async findAllProfesores() {
    return await this.usuariosService.findAllProfesores();
  }
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  @Get('profesores/:id')
  @ApiOperation({ summary: 'Obtener un profesor por ID con su perfil' })
  async findOneProfesor(@Param('id', ParseIntPipe) id: number) {
    return await this.usuariosService.findOneProfesor(id);
  }
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  @Patch('profesores/:id')
  @ApiOperation({ summary: 'Actualizar un profesor y su perfil' })
  async updateProfesor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProfesorDto,
  ) {
    return await this.usuariosService.updateProfesor(id, dto);
  }

  // --- ELIMINAR ---
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario por ID' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.usuariosService.remove(id);
  }
}
