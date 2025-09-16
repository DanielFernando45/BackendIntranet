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
    const user = await this.usuarioRepo.findOne({
      where: { username },
      relations: ['rol'],
    });
    const passwordValid = user
      ? await bcrypt.compare(password, user.password)
      : false;
    if (!user || !passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async login(user: Usuario) {
    // console.log(user)
    let datos: { id: number; nombre: string; area?: string } = {
      id: 0,
      nombre: '',
      area: '',
    };
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.rol.nombre,
    };

    if (user.rol.nombre === 'admin') {
      const getInfoAdmin = await this.adminRepo
        .createQueryBuilder('admin')
        .select([
          'admin.id as id',
          'admin.nombre as nombre',
          'area.id as id_area',
        ])
        .leftJoin('admin.usuario', 'usuario')
        .leftJoin('admin.area', 'area')
        .where('usuario.id = :id', { id: user.id })
        .getRawOne();
      // const getInfoAdmin = await this.adminRepo.findOne({
      //   where: { usuario: { id: user.id } },
      //   relations: ['usuario'],
      //   select: ['id', 'nombre'],
      // });
      if (getInfoAdmin === null) {
        throw new NotFoundException(
          'No se encontró un administrador con ese ID',
        );
      }
      if (!getInfoAdmin) {
        throw new NotFoundException(
          'No se encontró un administrador con ese ID',
        );
      }

      datos = {
        id: getInfoAdmin.id,
        nombre: getInfoAdmin.nombre,
        area: getInfoAdmin.id_area, // aquí ya puedes acceder al id del área
      };
    }

    if (user.rol.nombre === 'asesor') {
      // const getInfoAsesor = await this.asesorRepo.findOne({
      //   where: { usuario: { id: user.id } },
      //   relations: ['usuario'],
      //   select: ['id', 'nombre'],
      // });

      const getInfoAsesor = await this.asesorRepo
        .createQueryBuilder('asesor')
        .select([
          'asesor.id as id',
          'asesor.nombre as nombre',
          'area.id as area_id',
        ])
        .leftJoin('asesor.area', 'area')
        .innerJoin('asesor.usuario', 'usuario')
        .where('usuario.id = :id', { id: user.id })
        .getRawOne();
      if (getInfoAsesor === null || getInfoAsesor === undefined) {
        throw new NotFoundException('No se encontró un asesor con ese ID');
      }
      datos = {
        id: getInfoAsesor.id,
        nombre: getInfoAsesor.nombre,
        area: getInfoAsesor.area_id ?? 'Area no asignada',
      };
    }
    if (user.rol.nombre === 'estudiante') {
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

    if (datos.id === 0 && datos.nombre === '') {
      // if (user.role != 'admin' && user.role != 'asesor' && user.role != 'estudiante') {
      const getInfoAdmin = await this.adminRepo
        .createQueryBuilder('admin')
        .select([
          'admin.id as id',
          'admin.nombre as nombre',
          'area.id as id_area',
        ])
        .innerJoin('admin.usuario', 'usuario')
        .leftJoin('admin.area', 'area')
        .where('usuario.id = :id', { id: user.id })
        .getRawOne();
      console.log(getInfoAdmin);
      if (getInfoAdmin === null) {
        throw new NotFoundException('No se encontró un usuario con ese ID');
      }

      datos = {
        id: getInfoAdmin.id,
        nombre: getInfoAdmin.nombre,
        area: getInfoAdmin.id_area, // aquí ya puedes acceder al id del área
      };
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
        role: user.rol,
        id_area: datos.area,
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
  
  async changePassword(
    id: number,
    oldPassword: string,
    newPassword: string,
    repeatPassword: string,
  ) {
    // Buscar usuario
    const user = await this.usuarioRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Comparar contraseña actual
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException('La contraseña actual no es correcta');
    }

    // Validar coincidencia de nuevas contraseñas
    if (newPassword !== repeatPassword) {
      throw new BadRequestException('Las nuevas contraseñas no coinciden');
    }

    // Validar que no sea la misma contraseña
    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
      throw new BadRequestException(
        'La nueva contraseña no puede ser igual a la anterior',
      );
    }

    // Hashear y guardar
    user.password = await bcrypt.hash(newPassword, 10);
    await this.usuarioRepo.save(user);

    return { message: 'Contraseña cambiada correctamente' };
  }
}
