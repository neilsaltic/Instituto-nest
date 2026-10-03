import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register.dto.js';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto.js';
import { EstadoUsuario } from '../generated/prisma/enums.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  obtenerRondasSalt(): number {
    return this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const usuario = await this.usuarioService.findByEmail(email);

    if (usuario && (await bcrypt.compare(password, usuario.password))) {
      const { password: _, ...resto } = usuario;
      return resto;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Validar si el usuario existe
    const usuario = await this.usuarioService.findByEmail(email);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Validar contraseña
    const isPasswordValid = await bcrypt.compare(password, usuario.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Validar estado del usuario
    if (usuario.estado === EstadoUsuario.PENDIENTE) {
      throw new ForbiddenException(
        'Tu cuenta está pendiente de aprobación tras la verificación del pago de matrícula.',
      );
    }
    if (usuario.estado === EstadoUsuario.SUSPENDIDO_MORA) {
      throw new ForbiddenException(
        'Cuenta suspendida por deudas o mora pendiente.',
      );
    }
    if (usuario.estado === EstadoUsuario.INACTIVO) {
      throw new ForbiddenException('Cuenta de usuario inactiva.');
    }

    // 4. Generar token y respuesta
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
        estado: usuario.estado,
      },
    };
  }

  async register(registerDto: RegisterUserDto) {
    const usuario = await this.usuarioService.createEstudiante(registerDto);
    return {
      mensaje:
        'Registro realizado con éxito. Realiza el pago para activar tu cuenta.',
      usuario,
    };
  }
}
