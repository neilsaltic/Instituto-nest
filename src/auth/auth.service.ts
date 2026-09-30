import { Injectable } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuariosService,
    private jwtService: JwtService,
  ) {}
  async validateUser(email: string, password: string): Promise<any> {
    const usuario = await this.usuarioService.findByEmail(email);

    if (usuario && (await bcrypt.compare(password, usuario.password))) {
      const { password, ...resto } = usuario;
      return resto;
    }
    return null;
  }
  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.rol,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      usuario: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
      },
    };
  }
  async register(registerDto: RegisterUserDto) {
    const usuario = await this.usuarioService.create(registerDto);
    return {
      mensaje: 'Usuario registrado con exito',
      usuario,
    };
  }
}
