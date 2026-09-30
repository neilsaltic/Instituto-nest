import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import { Rol } from '../generated/prisma/enums.js';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createUsuarioDto: CreateUsuarioDto) {
    const existeemail = await this.findByEmail(createUsuarioDto.email);
    if (existeemail) {
      throw new ConflictException('el correo electronico ya esta registrado');
    }

    const existeCi = await this.prisma.usuario.findUnique({
      where: { ci: createUsuarioDto.ci },
    });
    if (existeCi) {
      throw new ConflictException('el Ci ya se encuentra registratdo');
    }
    const passwordhashed = await bcrypt.hash(createUsuarioDto.password, 10);

    return await this.prisma.usuario.create({
      data: {
        ...createUsuarioDto,
        password: passwordhashed,
        rol: createUsuarioDto.rol ?? Rol.ESTUDIANTE,
        fechaNacimiento: new Date(createUsuarioDto.fechaNacimiento),
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        ci: true,
        telefono: true,
        rol: true,
        estado: true,
        creadoEn: true,
      },
    });
  }

  async findAll(rol?: Rol) {
    return await this.prisma.usuario.findMany({
      where: rol ? { rol } : {},
      omit: { password: true },
      include: { perfilEstudiante: true, perfilProfesor: true },
    });
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: { perfilEstudiante: true, perfilProfesor: true },
    });
    if (!usuario) {
      throw new NotFoundException(`usuario con id: ${id} no existe`);
    }
    const { password, ...resto } = usuario;
    return resto;
  }
  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
    });
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    await this.findOne(id);

    const data: any = { ...updateUsuarioDto };

    if (updateUsuarioDto.password) {
      data.password = await bcrypt.hash(updateUsuarioDto.password, 10);
    }
    if (updateUsuarioDto.fechaNacimiento) {
      data.fechaNacimiento = new Date(updateUsuarioDto.fechaNacimiento);
    }

    return this.prisma.usuario.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        estado: true,
        actualizadoEn: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.usuario.delete({
      where: { id },
    });

    return { mensaje: 'Usuario Eliminado exitosamente' };
  }
}
