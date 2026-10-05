import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import { EstadoUsuario, Rol } from '../generated/prisma/enums.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { CreateProfesorDto } from './dto/create-profesor.dto.js';
import { UpdateProfesorDto } from './dto/update-profesor.dto.js';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  // --- SELECCIÓN LIMPIA DE RESPUESTA ---
  private selectUsuarioConPerfil = {
    id: true,
    email: true,
    nombre: true,
    apellido: true,
    ci: true,
    fechaNacimiento: true,
    telefono: true,
    rol: true,
    estado: true,
    creadoEn: true,
    actualizadoEn: true,
    perfilEstudiante: true,
    perfilProfesor: true,
  };

  // ==========================================
  // 1. MÉTODOS DE CREACIÓN
  // ==========================================

  async createEstudiante(dto: CreateUsuarioDto) {
    await this.validarEmailYCi(dto.email, dto.ci);

    const passwordHashed = await bcrypt.hash(dto.password, 10);

    return await this.prisma.usuario.create({
      data: {
        email: dto.email,
        password: passwordHashed,
        nombre: dto.nombre,
        apellido: dto.apellido,
        ci: dto.ci,
        fechaNacimiento: new Date(dto.fechaNacimiento),
        telefono: dto.telefono,
        rol: Rol.ESTUDIANTE,
        estado: dto.estado ?? EstadoUsuario.PENDIENTE,
        perfilEstudiante: {
          create: {
            codigoMatricula: `MAT-${Date.now()}`,
            nombreTutor: dto.nombreTutor || 'Sin Asignar',
            telefonoTutor: dto.telefonoTutor || '00000000',
          },
        },
      },
      select: this.selectUsuarioConPerfil,
    });
  }

  async createProfesor(dto: CreateProfesorDto) {
    await this.validarEmailYCi(dto.email, dto.ci);

    const passwordHashed = await bcrypt.hash(dto.password, 10);

    return await this.prisma.usuario.create({
      data: {
        email: dto.email,
        password: passwordHashed,
        nombre: dto.nombre,
        apellido: dto.apellido,
        ci: dto.ci,
        fechaNacimiento: new Date(dto.fechaNacimiento),
        telefono: dto.telefono,
        rol: Rol.PROFESOR,
        estado: dto.estado ?? EstadoUsuario.ACTIVO,
        perfilProfesor: {
          create: {
            especialidad: dto.especialidad,
            fechaContratacion: dto.fechaContratacion
              ? new Date(dto.fechaContratacion)
              : new Date(),
          },
        },
      },
      select: this.selectUsuarioConPerfil,
    });
  }

  async createRecepcionista(dto: CreateUsuarioDto) {
    await this.validarEmailYCi(dto.email, dto.ci);

    const passwordHashed = await bcrypt.hash(dto.password, 10);

    return await this.prisma.usuario.create({
      data: {
        email: dto.email,
        password: passwordHashed,
        nombre: dto.nombre,
        apellido: dto.apellido,
        ci: dto.ci,
        fechaNacimiento: new Date(dto.fechaNacimiento),
        telefono: dto.telefono,
        rol: Rol.RECEPCIONISTA,
        estado: dto.estado ?? EstadoUsuario.ACTIVO,
      },
      select: this.selectUsuarioConPerfil,
    });
  }

  // ==========================================
  // 2. MÉTODOS DE BÚSQUEDA Y LISTADO
  // ==========================================

  async findAllEstudiantes() {
    return await this.prisma.usuario.findMany({
      where: { rol: Rol.ESTUDIANTE },
      select: this.selectUsuarioConPerfil,
    });
  }

  async findAllProfesores() {
    return await this.prisma.usuario.findMany({
      where: { rol: Rol.PROFESOR },
      select: this.selectUsuarioConPerfil,
    });
  }
  async findAllRecepcionista() {
    return await this.prisma.usuario.findMany({
      where: { rol: Rol.RECEPCIONISTA },
      select: this.selectUsuarioConPerfil,
    });
  }

  async findOneEstudiante(id: number) {
    const estudiante = await this.prisma.usuario.findFirst({
      where: { id, rol: Rol.ESTUDIANTE },
      select: this.selectUsuarioConPerfil,
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${id} no fue encontrado`);
    }

    return estudiante;
  }

  async findOneProfesor(id: number) {
    const profesor = await this.prisma.usuario.findFirst({
      where: { id, rol: Rol.PROFESOR },
      select: this.selectUsuarioConPerfil,
    });

    if (!profesor) {
      throw new NotFoundException(`Profesor con ID ${id} no fue encontrado`);
    }

    return profesor;
  }
  async findOneRecepcionista(id: number) {
    const profesor = await this.prisma.usuario.findFirst({
      where: { id, rol: Rol.RECEPCIONISTA },
      select: this.selectUsuarioConPerfil,
    });

    if (!profesor) {
      throw new NotFoundException(`Profesor con ID ${id} no fue encontrado`);
    }

    return profesor;
  }

  // ==========================================
  // 3. MÉTODOS DE ACTUALIZACIÓN (UPDATE)
  // ==========================================

  async updateEstudiante(id: number, dto: UpdateUsuarioDto) {
    await this.findOneEstudiante(id);

    const {
      password,
      fechaNacimiento,
      nombreTutor,
      telefonoTutor,
      ...restoDatos
    } = dto;

    const dataUsuario: any = { ...restoDatos };

    if (password) {
      dataUsuario.password = await bcrypt.hash(password, 10);
    }
    if (fechaNacimiento) {
      dataUsuario.fechaNacimiento = new Date(fechaNacimiento);
    }

    if (nombreTutor || telefonoTutor) {
      dataUsuario.perfilEstudiante = {
        update: {
          ...(nombreTutor && { nombreTutor }),
          ...(telefonoTutor && { telefonoTutor }),
        },
      };
    }

    return await this.prisma.usuario.update({
      where: { id },
      data: dataUsuario,
      select: this.selectUsuarioConPerfil,
    });
  }

  async updateProfesor(id: number, dto: UpdateProfesorDto) {
    await this.findOneProfesor(id);

    const {
      password,
      fechaNacimiento,
      especialidad,
      fechaContratacion,
      ...restoDatos
    } = dto;

    const dataUsuario: any = { ...restoDatos };

    if (password) {
      dataUsuario.password = await bcrypt.hash(password, 10);
    }
    if (fechaNacimiento) {
      dataUsuario.fechaNacimiento = new Date(fechaNacimiento);
    }

    if (especialidad || fechaContratacion) {
      dataUsuario.perfilProfesor = {
        update: {
          ...(especialidad && { especialidad }),
          ...(fechaContratacion && {
            fechaContratacion: new Date(fechaContratacion),
          }),
        },
      };
    }

    return await this.prisma.usuario.update({
      where: { id },
      data: dataUsuario,
      select: this.selectUsuarioConPerfil,
    });
  }

  // ==========================================
  // 4. MÉTODOS AUXILIARES
  // ==========================================

  async findByEmail(email: string) {
    return await this.prisma.usuario.findUnique({
      where: { email },
    });
  }

  async remove(id: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no existe`);
    }

    await this.prisma.usuario.delete({ where: { id } });

    return { mensaje: 'Usuario eliminado exitosamente' };
  }

  private async validarEmailYCi(email: string, ci: string) {
    const existeEmail = await this.findByEmail(email);
    if (existeEmail) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const existeCi = await this.prisma.usuario.findUnique({ where: { ci } });
    if (existeCi) {
      throw new ConflictException('El CI ya se encuentra registrado');
    }
  }
  async findById(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: this.selectUsuarioConPerfil,
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no fue encontrado`);
    }

    return usuario;
  }
}
