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
    if (!user.estado) {
      throw new NotFoundException(
        'El usuario está inactivo, por favor contacta al administrador',
      );
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.rol.nombre,
    };

    const datos = {
      id: user.id,
      nombre: user.username,
      area: 'Área no asignada',
    };

    const relationName = user.rol.nombre.toLowerCase();

    const usuarioRelation = this.usuarioRepo.metadata.relations.find(
      (r) => r.propertyName === relationName,
    );

    if (usuarioRelation) {
      try {
        const roleAlias = relationName;
        let qb = this.usuarioRepo
          .createQueryBuilder('usuario')
          .leftJoinAndSelect(`usuario.${relationName}`, roleAlias);

        const roleMetadata = usuarioRelation.inverseEntityMetadata;

        const areaRelation = roleMetadata.relations.find(
          (r) => r.propertyName === 'area' || r.propertyName === 'areas',
        );

        if (areaRelation) {
          qb = qb.leftJoinAndSelect(
            `${roleAlias}.${areaRelation.propertyName}`,
            'areas',
          );
        }

        const usuarioConRol = await qb
          .where('usuario.id = :id', { id: user.id })
          .getOne();

        console.log(
          'DEBUG usuario con rol y áreas:',
          JSON.stringify(usuarioConRol, null, 2),
        );

        const roleEntity = usuarioConRol
          ? (usuarioConRol as any)[relationName]
          : null;

        if (roleEntity) {
          datos.id = roleEntity.id ?? datos.id;
          datos.nombre = roleEntity.nombre ?? datos.nombre;

          if (areaRelation) {
            const areas = roleEntity[areaRelation.propertyName];
            console.log('DEBUG áreas encontradas:', areas);

            if (Array.isArray(areas)) {
              // Caso Supervisor → varias áreas
              datos.area =
                areas.length > 0
                  ? areas.map((a: any) => a.nombre).join(', ')
                  : 'Sin áreas';
            } else if (areas) {
              // Caso Asesor → un solo área
              datos.area = areas.nombre ?? 'Área no asignada';
            } else {
              datos.area = 'Área no asignada';
            }
          }
        }
      } catch (err) {
        console.error('Error cargando relación dinámica:', err);
      }
    }

    return {
      access_token: this.jwtService.sign(payload),
      id_usuario: user.id,
      datos_usuario: {
        id: datos.id,
        nombre: datos.nombre,
        role: user.rol,
        area: datos.area,
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
