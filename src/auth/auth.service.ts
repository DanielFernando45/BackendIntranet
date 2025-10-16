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

    const qb = this.usuarioRepo
      .createQueryBuilder('u')
      .leftJoin(Supervisor, 's', 's.usuarioId = u.id')
      .leftJoin(Area, 'a', 'a.id_supervisor = s.id')
      .leftJoin(Cliente, 'c', 'c.usuarioId = u.id')
      .leftJoin(Asesor, 'as', 'as.usuarioId = u.id')
      .leftJoin(Admin, 'ad', 'ad.usuarioId = u.id')
      .addSelect([
        's.id AS s_id',
        's.nombre AS su_nombre',
        'c.id AS id_Cliente',
        'c.nombre AS cli_nombre',
        'c.apellido AS cli_apellido',
        'a.nombre AS a_nombre',
        'as.id AS id_Asesor',
        'as.nombre AS ase_nombre',
        'as.apellido AS ase_apellido',
        'ad.id AS id_Admin',
        'ad.nombre AS admin_nombre',
      ])
      .where('u.id = :id', { id: user.id });

    const raw = await qb.getRawOne();

    const idUsuario = user.id;
    const idSupervisor = raw?.s_id ?? null;
    const idCliente = raw?.id_Cliente ?? null;
    const idAsesor = raw?.id_Asesor ?? null;
    const idAdmin = raw?.id_Admin ?? null;

    // 🔍 Función para obtener solo primer nombre y apellido
    const obtenerNombreCorto = (nombre?: string, apellido?: string) => {
      const primerNombre = nombre?.split(' ')[0] ?? '';
      const primerApellido = apellido?.split(' ')[0] ?? '';
      return [primerNombre, primerApellido].filter(Boolean).join(' ');
    };

    // ✅ Construir nombre corto según prioridad
    const nombre =
      (raw.ase_nombre &&
        raw.ase_apellido &&
        obtenerNombreCorto(raw.ase_nombre, raw.ase_apellido)) ||
      (raw.cli_nombre &&
        raw.cli_apellido &&
        obtenerNombreCorto(raw.cli_nombre, raw.cli_apellido)) ||
      (raw.su_nombre && obtenerNombreCorto(raw.su_nombre, '')) ||
      (raw.admin_nombre &&
        raw.admin_apellido &&
        obtenerNombreCorto(raw.admin_nombre, raw.admin_apellido)) ||
      user.username;

    const area = raw?.a_nombre ?? null;

    const payload: any = {
      sub: idUsuario,
      username: user.username,
      role: user.rol.nombre,
    };

    if (idSupervisor) payload.id_supervisor = idSupervisor;

    const datos_usuario: any = {
      username: user.username,
      nombre, // 👈 Primer nombre y apellido
      role: user.rol,
      id_usuario: idUsuario,
    };

    if (idSupervisor) datos_usuario.id_supervisor = idSupervisor;
    if (idCliente) datos_usuario.id_cliente = idCliente;
    if (idAsesor) datos_usuario.id_asesor = idAsesor;
    if (idAdmin) datos_usuario.id_admin = idAdmin;
    if (user.rol.nombre === 'supervisor' && area) datos_usuario.area = area;

    return {
      access_token: this.jwtService.sign(payload),
      id_usuario: idUsuario,
      datos_usuario,
    };
  }

  async sendMailPassword(email: string) {
    // Buscar cliente en la base de datos
    const cliente = await this.clienteRepo.findOne({
      where: { email },
      relations: ['usuario'],
    });

    // ✅ Si el correo no pertenece a un clie nte, devolver respuesta genérica
    // (para evitar ataques de enumeración de correos)
    if (!cliente || !cliente.usuario) {
      console.warn(
        `Intento de recuperación con correo no registrado: ${email}`,
      );
      // Devuelve un mensaje específico
      throw new BadRequestException(
        'El correo ingresado no pertenece a un cliente registrado',
      );
    }

    // Generar token JWT con vencimiento de 15 minutos
    const token = this.jwtService.sign({ email }, { expiresIn: '15m' });

    // Leer la URL base del frontend desde las variables de entorno
    const frontBaseUrl = process.env.FRONT_PORT_ENV;

    // Construir enlace completo para el frontend
    const resetUrl = `${frontBaseUrl}/cambiarContraseña/${token}`;

    try {
      // Enviar el correo de restablecimiento
      await this.mailService.sendResetPasswordEmail(email, resetUrl);

      return {
        message: 'Si el correo está registrado, se ha enviado un enlace',
      };
    } catch (error) {
      console.error('❌ Error enviando el correo:', error);
      throw new BadRequestException(
        'No se pudo enviar el correo, inténtalo más tarde',
      );
    }
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
