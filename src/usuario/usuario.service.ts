import {
  ConflictException,
  Injectable,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole, Usuario } from './usuario.entity';
import { EntityManager, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
  ) {}
  async createUserDefault(data: CreateUserDto) {
    // 1️⃣ Verificar si el usuario ya existe
    const exist = await this.usuarioRepo.findOneBy({ username: data.username });
    if (exist) throw new ConflictException('Ese usuario ya existe');

    // 2️⃣ Hashear la contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 3️⃣ Crear el usuario, incluyendo el id_rol si viene
    const { id_rol, ...rest } = data;
    const newUser = this.usuarioRepo.create({
      ...rest,
      password: hashedPassword,
    });

    // 4️⃣ Guardar en la base de datos
    const savedUsuario = await this.usuarioRepo.save(newUser);
    return savedUsuario;
  }

  async desactivateUser(id: number) {
    const user = await this.usuarioRepo.update({ id }, { estado: false });
    if (!user)
      throw new NotFoundException('No se encuentro registrado ese usuario');
    return user.affected;
  }

  async deleteUserWithCliente(id: number, manager: EntityManager) {
    const deleted_user = await manager.delete(Usuario, { id });
    if (deleted_user.affected === 0)
      throw new NotFoundException('No hay un usuaurio con ese ID');
    return true;
  }
}
