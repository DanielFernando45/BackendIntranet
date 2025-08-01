import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Usuario } from '../usuario/usuario.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/admin/admin.entity';
import * as bcrypt from 'bcrypt';
import { Asesor } from 'src/asesor/asesor.entity';
import { Cliente } from 'src/cliente/cliente.entity';
import { UsuarioService } from 'src/usuario/usuario.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly mailService: MailService,

    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
    @InjectRepository(Asesor)
    private asesorRepo: Repository<Asesor>,
    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,

    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.usuarioRepo.findOneBy({ username });
    const passwordValid = user
      ? await bcrypt.compare(password, user.password)
      : false;
    if (!user || !passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async login(user: Usuario) {
    let datos: { id: number; nombre: string } = { id: 0, nombre: '' };
    const payload = { sub: user.id, username: user.username, role: user.role };

    if (user.role === 'admin') {
      const getInfoAdmin = await this.adminRepo.findOne({
        where: { usuario: { id: user.id } },
        relations: ['usuario'],
        select: ['id', 'nombre'],
      });
      if (getInfoAdmin === null) {
        throw new NotFoundException(
          'No se encontró un administrador con ese ID',
        );
      }
      datos = getInfoAdmin;
    }

    if (user.role === 'asesor') {
      const getInfoAsesor = await this.asesorRepo.findOne({
        where: { usuario: { id: user.id } },
        relations: ['usuario'],
        select: ['id', 'nombre'],
      });
      if (getInfoAsesor === null) {
        throw new NotFoundException('No se encontró un asesor con ese ID');
      }
      datos = getInfoAsesor;
    }
    if (user.role === 'estudiante') {
      const getInfoCliente = await this.clienteRepo.findOne({
        where: { usuario: { id: user.id } },
        relations: ['usuario'],
        select: ['id', 'nombre'],
      });
      if (getInfoCliente === null) {
        throw new NotFoundException('No se encontró un estudiante con ese ID');
      }
      datos = getInfoCliente;
    }

    if (user.estado === false) {
      throw new NotFoundException(
        'El usuario está inactivo, por favor contacta al administrador',
      );
    }

    return {
      access_token: this.jwtService.sign(payload),
      id_usuario: user.id,
      datos_usuario: {
        id: datos.id,
        nombre: datos.nombre,
        role: user.role,
      },
    };
  }

  async sendMailPassword(email: string) {
    const url_codified = this.jwtService.sign(
      { email },
      { expiresIn: '15min' },
    );
    const url = `http://localhost:5174/cambiarContraseña/${url_codified}`;

    await this.mailService.sendResetPasswordEmail(email, url);

    return {
      message: 'Si el correo está registrado, se ha enviado un enlace',
    };
  }

  async recoverPassword(token: string, newPassword: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch (err) {
      throw new BadRequestException('Token invalido o expirado');
    }

    const user = await this.usuarioRepo.findOneBy({ username: payload.email });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    user.password = await bcrypt.hash(newPassword, 10);
    await this.usuarioRepo.save(user);

    return { message: 'Contraseña cambiada correctamente' };
  }
  async changePassword(id: number, oldPassword: string, newPassword: string) {
    const searchedUser = await this.usuarioRepo.findOneBy({ id });
    if (!searchedUser) throw new NotFoundException('No se encuentra ese user');
    const comparationPassword = searchedUser
      ? await bcrypt.compare(oldPassword, searchedUser.password)
      : false;
    if (!comparationPassword) {
      throw new BadRequestException('No es correcta la contraseña ingresada');
    }
    const newHashed = await bcrypt.hash(newPassword, 10);
    searchedUser.password = newHashed;

    const updated = await this.usuarioRepo.save(searchedUser);

    return { message: 'Contraseña cambiada correctamente' };
  }
}
