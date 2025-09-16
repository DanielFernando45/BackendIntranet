import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import { Usuario, UserRole } from '../usuario/usuario.entity';
import { CreateUserDto } from 'src/usuario/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { ListarClienteDto } from './dto/listar-admin.dto';
import { CrearAdminDto } from './dto/crear-admin.dto';
import { UpdateClienteDto } from './dto/update-admin.dto';
import { UsuarioService } from 'src/usuario/usuario.service';
import { Rol } from '../rol/entities/rol.entity';

@Injectable()
export class AdminService {
  constructor(
    private readonly usuarioService: UsuarioService,

    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
    @InjectRepository(Rol)
    private rolRepo: Repository<Rol>,
  ) {}

  async listAdmin(): Promise<ListarClienteDto[]> {
    const listofAdmin = await this.adminRepo.find();
    const mapedAdmin: ListarClienteDto[] = listofAdmin.map((admin) => ({
      nombre: admin.nombre,
      email: admin.email,
      dni: admin.dni,
    }));
    if (listofAdmin.length === 0) {
      throw new NotFoundException('No hay administradores registrados');
    }
    return mapedAdmin;
  }

  async listOneAdmin(id: number): Promise<ListarClienteDto> {
    const oneAdmin = await this.adminRepo.findOne({ where: { id } });
    if (oneAdmin === null) {
      throw new NotFoundException(
        'No se encontró un administrador con el ID proporcionado',
      );
    }
    return oneAdmin;
  }
  async createAdmin(data: CrearAdminDto) {
    try {
      // 1️⃣ Verificar si el admin ya existe por email
      const exist = await this.adminRepo.findOne({
        where: { email: data.email },
        relations: ['usuario'],
      });
      if (exist) throw new ConflictException('Ya existe ese administrador');

      // 2️⃣ Buscar el rol en la tabla Rol
      const rolNombre = data.role ? data.role : UserRole.ADMIN;
      const rol = await this.rolRepo.findOneBy({ nombre: rolNombre });
      if (!rol) throw new NotFoundException(`Rol ${rolNombre} no encontrado`);

      // 3️⃣ Crear el usuario con relación al rol
      const dataUser = {
        username: data.email,
        password: data.dni,
        estado: true,
        rol, // <-- asignamos el objeto Rol completo
      };
      const savedUser = await this.usuarioService.createUserDefault(dataUser);

      // 4️⃣ Crear el admin y asociarlo al usuario
      const admin = this.adminRepo.create({
        nombre: data.nombre,
        email: data.email,
        dni: data.dni,
        usuario: savedUser,
        id_rol: savedUser.rol.id, // <-- asignamos el id del rol del usuario
      });

      // 5️⃣ Guardar en la base de datos
      return await this.adminRepo.save(admin);
    } catch (err) {
      if (
        err instanceof ConflictException ||
        err instanceof NotFoundException
      ) {
        throw err;
      }
      console.error('Error creando administrador:', err);
      throw new InternalServerErrorException('Error al crear el administrador');
    }
  }

  async patchAdmin(data: UpdateClienteDto, id: number) {
    if (!Object.keys(data).length) {
      throw new BadRequestException(
        'No se proporcionaron campos para actualizar',
      );
    }
    const updateAdmin = await this.adminRepo.update({ id: id }, data);

    if (updateAdmin.affected === 0)
      throw new NotFoundException('No se afecto ninguna columna');
    return data;
  }

  async deleteAdmin(id: number) {
    const deleted = await this.adminRepo.delete({ id });
    if (deleted.affected === 0)
      throw new NotFoundException('No se encontro un Admin con ese id');
    return {
      message: 'Admin eliminado correctamente',
      affected: deleted.affected,
    };
  }

  async desactivateAdmin(id: number) {
    const admin = await this.adminRepo.findOne({
      where: { id },
      relations: ['usuario'],
      select: { usuario: { id: true } },
    });
    if (!admin)
      return new NotFoundException('No se encontro el cliente en la bd');
    const id_usuario = admin?.usuario.id;
    if (!id_usuario) throw new NotFoundException('No se encontro el id');

    const response = await this.usuarioService.desactivateUser(id_usuario);
    return {
      message: 'Usuario desactivado correctamente',
      affectado: response,
    };
  }

  async changePassword(oldPassword, newPassword, repeatPassword) {
    if (newPassword !== repeatPassword) {
      return new BadRequestException('No son las mismas contraseñas');
    }
    //const response=await this.usuarioService
    return 1;
  }

  async getAreaAsesorByIdArea(id: number) {
    const areaAsesor = await this.adminRepo
      .createQueryBuilder('admin')
      .select([
        'DISTINCT area.id AS id_area ',
        'area.nombre as area',
        'asesor.id AS id_asesor',
        'asesor.nombre AS nombre_asesor',
      ])
      .innerJoin('admin.area', 'area')
      .innerJoin('area.asesores', 'asesor')
      .where('area.id = :id', { id })
      .getRawMany();

    // const area = await this.adminRepo.findOne({
    //     where: { id },
    //     relations: ['area'],
    //     select: { area: { id: true, nombre: true } }
    // });

    // if (!area || !area.area) {
    //     throw new NotFoundException("No se encontró el área del asesor con el ID proporcionado");
    // }

    return areaAsesor;
  }
}
