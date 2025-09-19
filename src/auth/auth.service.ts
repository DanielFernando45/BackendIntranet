import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Usuario } from '../usuario/usuario.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/admin/admin.entity';
import * as bcrypt from 'bcrypt';
import { Asesor } from 'src/asesor/asesor.entity';
import { Cliente } from 'src/cliente/cliente.entity';
import { UsuarioService } from 'src/usuario/usuario.service';
import { MailService } from 'src/mail/mail.service';
import { Supervisor } from 'src/supervisor/entities/supervisor.entity';
import { Area } from 'src/area/entities/area.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly mailService: MailService,

    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
    @InjectRepository(Supervisor)
    private supervisorRepo: Repository<Supervisor>,
    @InjectRepository(Area)
    private areaRepo: Repository<Area>,
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
    if (!user.estado) {
      throw new NotFoundException(
        'El usuario está inactivo, por favor contacta al administrador',
      );
    }

    // 1. JOIN explícito por claves foráneas
    const qb = this.usuarioRepo
      .createQueryBuilder('u')
      .leftJoin(Supervisor, 's', 's.usuarioId = u.id') // usuarios → supervisor
      .leftJoin(Area, 'a', 'a.id_supervisor = s.id') // supervisor → area
      .leftJoin(Cliente, 'c', 'c.usuarioId = u.id') // usuarios → cliente
      .leftJoin(Asesor, 'as', 'as.usuarioId = u.id') // usuarios → asesor
      .addSelect([
        's.id AS s_id',
        's.nombre AS su_nombre',
        'c.id AS id_Cliente',
        'c.nombre AS cli_nombre',
        'a.nombre AS a_nombre',
        'as.id AS id_Asesor',
        'as.nombre AS ase_nombre',
      ])
      .where('u.id = :id', { id: user.id });

    const raw = await qb.getRawOne();

    // 2. Extraer datos
    const idUsuario = user.id;
    const idSupervisor = raw?.s_id ?? null;
    const idCliente = raw?.id_Cliente ?? null; 
    const idAsesor = raw?.id_Asesor ?? null;
    const nombre =  raw.ase_nombre ?? raw.su_nombre ?? raw.cli_nombre ?? user.username;
    const area = raw?.a_nombre ?? 'Área no asignada';

    // 3. Crear el payload con id_supervisor incluido
    const payload = {
      sub: idUsuario,
      username: user.username,
      role: user.rol.nombre,
      id_supervisor: idSupervisor, // ← YA definido correctamente aquí
    };

    // 4. Devolver respuesta
    return {
      access_token: this.jwtService.sign(payload),
      id_usuario: idUsuario,
      datos_usuario: {
        id_usuario: idUsuario,
        id_supervisor: idSupervisor,
        id_cliente: idCliente,
        id_asesor: idAsesor,
        username: user.username,
        nombre,
        role: user.rol,
        area,
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
