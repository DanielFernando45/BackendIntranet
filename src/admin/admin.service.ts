import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity'
import { Usuario, UserRole } from '../usuario/usuario.entity'
import * as bcrypt from "bcrypt"
import { ListarClienteDto } from './dto/listar-admin.dto';
import { CrearlienteDto } from './dto/crear-admin.dto';
import { UpdateClienteDto } from './dto/update-admin.dto';
import { CreateUserDto } from 'src/usuario/dto/create-user.dto';
import { UsuarioService } from 'src/usuario/usuario.service';

@Injectable()
export class AdminService {
    constructor(
        private readonly usuarioService: UsuarioService,

        @InjectRepository(Admin)
        private adminRepo: Repository<Admin>,
        @InjectRepository(Usuario)
        private usuarioRepo: Repository<Usuario>,
    ) { }

    async listAdmin(): Promise<ListarClienteDto[]> {
        const listofAdmin = await this.adminRepo.find()
        const mapedAdmin: ListarClienteDto[] = listofAdmin.map(admin => ({
            nombre: admin.nombre,
            email: admin.email,
            dni: admin.dni
        }))
        if (listofAdmin.length === 0) {
            throw new NotFoundException("No hay administradores registrados");
        }
        return mapedAdmin
    }

    async listOneAdmin(id: number): Promise<ListarClienteDto> {

        const oneAdmin = await this.adminRepo.findOne({ where: { id } })
        if (oneAdmin === null) {
            throw new NotFoundException("No se encontró un administrador con el ID proporcionado");
        }
        return oneAdmin

    }

    async create(data: CrearlienteDto) {
        let savedUser: CreateUserDto

        const exist = await this.adminRepo.findOneBy({ email: data.email })
        if (exist) throw new ConflictException("Ya existe ese asesor")
        const dataUser = {
            username: data.email,
            password: data.dni,
            role: UserRole.ADMIN,
            estado: true
        }
        savedUser = await this.usuarioService.createUserDefault(dataUser)
        try {

            const admin = this.adminRepo.create({
                ...data,
                usuario: savedUser
            });
            return this.adminRepo.save(admin)
        } catch (err) {
            throw new InternalServerErrorException("Error al crear el administrador")
        }
    }

    async patchAdmin(data: UpdateClienteDto, id: number) {
        if (!Object.keys(data).length) {
            throw new BadRequestException("No se proporcionaron campos para actualizar");
        }
        const updateAdmin = await this.adminRepo.update(
            { id: id },
            data)

        if (updateAdmin.affected === 0) throw new NotFoundException("No se afecto ninguna columna")
        return data

    }

    async deleteAdmin(id: number) {
        const deleted = await this.adminRepo.delete({ id })
        if (deleted.affected === 0) throw new NotFoundException("No se encontro un Admin con ese id")
        return { message: "Admin eliminado correctamente", affected: deleted.affected }
    }

    async desactivateAdmin(id: number) {
        const admin = await this.adminRepo.findOne({
            where: { id },
            relations: ['usuario'],
            select: { usuario: { id: true } }
        })
        if (!admin) return new NotFoundException("No se encontro el cliente en la bd")
        const id_usuario = admin?.usuario.id
        if (!id_usuario) throw new NotFoundException("No se encontro el id")

        const response = await this.usuarioService.desactivateUser(id_usuario)
        return { message: "Usuario desactivado correctamente", affectado: response }
    }

    async changePassword(oldPassword, newPassword, repeatPassword) {
        if (newPassword !== repeatPassword) {
            return new BadRequestException("No son las mismas contraseñas")
        }
        //const response=await this.usuarioService
        return 1
    }

    async getAreaAsesorByIdArea(id: number) {

        const areaAsesor = await this.adminRepo.createQueryBuilder('admin')
            .select(['DISTINCT area.id AS id_area ', 'area.nombre as area', 'asesor.id AS id_asesor', 'asesor.nombre AS nombre_asesor'])
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
