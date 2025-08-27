import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Asesor } from './asesor.entity';
import { DataSource, Repository } from 'typeorm';
import { Usuario, UserRole } from '../usuario/usuario.entity';
import { createAsesorDto } from './dto/crear-asesor.dto';
import * as bcrypt from "bcrypt"
import { listarAsesorDto } from './dto/listar-asesor.dto';
import { UpdateAsesorDto } from './dto/update-asesor.dto';
import { AreaAsesor } from 'src/common/entidades/areaAsesor.entity';
import { GradoAcademico } from 'src/common/entidades/gradoAcademico.entity';
import { ListarClienteDto } from 'src/admin/dto/listar-admin.dto';
import { CreateUserDto } from 'src/usuario/dto/create-user.dto';
import { UsuarioService } from 'src/usuario/usuario.service';
import { AsesoramientoService } from 'src/asesoramiento/asesoramiento.service';
import { ProcesosAsesoriaService } from 'src/procesos_asesoria/procesos_asesoria.service';
import { Asesoramiento } from 'src/asesoramiento/entities/asesoramiento.entity';
import { Area } from 'src/area/entities/area.entity';

@Injectable()
export class AsesorService {
    constructor(
        private readonly usuarioService: UsuarioService,
        private readonly asesoramientoService: AsesoramientoService,
        private readonly procesosAsesoriaService: ProcesosAsesoriaService,

        @InjectDataSource()
        private readonly dataSource: DataSource,

        @InjectRepository(Asesor)
        private asesorRepo: Repository<Asesor>,

        @InjectRepository(Area)
        private areaRepo: Repository<Area>,

        @InjectRepository(GradoAcademico)
        private gradoAcademicoRepo: Repository<GradoAcademico>,

    ) { }

    async listAsesor(): Promise<listarAsesorDto[]> {
        const listofAsesor = await this.asesorRepo.find({ relations: ["gradoAcademico", "areaAsesor"] })
        if (listofAsesor.length === 0) throw new NotFoundException("No se encontró ningún asesor");


        const mapedAsesor: listarAsesorDto[] = listofAsesor.map(asesor => ({
            id: asesor.id,
            dni: asesor.dni,
            nombre: asesor.nombre,
            apellido: asesor.apellido,
            email: asesor.email,
            telefono: asesor.telefono,
            url_imagen: asesor.url_imagen,
            area:{ id:asesor.area?.id,nombre:asesor.area?.nombre},
            gradoAcademico: { id: asesor.gradoAcademico?.id, nombre: asesor.gradoAcademico?.nombre },
            especialidad: asesor.especialidad,
            universidad: asesor.universidad
        }))
        return mapedAsesor
    }

    async listOneAsesor(id: number): Promise<listarAsesorDto> {
        const oneAsesor = await this.asesorRepo.findOne({ where: { id }, relations: ['area', 'gradoAcademico'] })
        if (oneAsesor === null) throw new Error("No hay un asesor con ese ID")
        const asesorDto: listarAsesorDto = {
            ...oneAsesor,
            area: { id: oneAsesor.area?.id, nombre: oneAsesor.area?.nombre },
            gradoAcademico: { id: oneAsesor.area?.id, nombre: oneAsesor.gradoAcademico?.nombre },

        }
        return asesorDto
    }

    async asesorPorArea(id_area: string) {
        const asesorArea = await this.asesorRepo.find({
            where: { area: { id: id_area } },
            select: ['id', 'nombre', 'apellido']
        })
        if (asesorArea.length === 0) throw new NotFoundException("No hay asesor con esa area")
        return asesorArea
    }

    async crearAsesor(data: createAsesorDto) {
        let savedUser: CreateUserDto

        const exist = await this.asesorRepo.findOneBy({ email: data.email })
        if (exist) throw new ConflictException("Ya existe ese asesor")
        const dataUser = {
            username: data.email,
            password: data.dni,
            role: UserRole.ASESOR,
            estado: true
        }
        savedUser = await this.usuarioService.createUserDefault(dataUser)

        try {

            const areaAsesorSearch = await this.areaRepo.findOneBy({ id: data.area });
            const gradoAcademicoSearch = await this.gradoAcademicoRepo.findOneBy({ id: data.gradoAcademico })

            if (!areaAsesorSearch || !gradoAcademicoSearch) throw new NotFoundException("Algunas entidades relacionadas no existen");

            const asesor = this.asesorRepo.create({
                ...data,
                area: areaAsesorSearch,
                gradoAcademico: gradoAcademicoSearch,
                usuario: savedUser
            })
            return await this.asesorRepo.save(asesor)
        } catch (err) {
            throw new BadRequestException()
        }
    }

    async patchAsesor(id: number, data: UpdateAsesorDto) {
        if (!Object.keys(data).length) {
            throw new BadRequestException("No hay contenido a actualizar")
        }
        const partialEntity: any = { ...data };
        console.log(partialEntity)
        if (data.areaAsesor) {
            partialEntity.areaAsesor = { id: data.areaAsesor };
        }
        if (data.gradoAcademico) {
            partialEntity.gradoAcademico = { id: data.gradoAcademico };
        }
        const updatedAsesor = await this.asesorRepo.update(
            { id },
            partialEntity)

        if (updatedAsesor.affected === 0) throw new NotFoundException("No se encuentra ese ID")
        return updatedAsesor
    }

    async deleteAsesor(id: number) {
        const deleted = await this.asesorRepo.delete({ id })
        if (deleted.affected === 0) throw new NotFoundException("No se encuentra ese ID")
        return {
            message: "Asesor eliminado correctamente", cantidad: deleted.affected
        }
    }

    async desactivateAsesor(id: number) {
        const cliente = await this.asesorRepo.findOne({
            where: { id },
            relations: ['usuario'],
            select: { usuario: { id: true } }
        })
        if (!cliente) return new NotFoundException("No se encontro el cliente en la bd")
        const id_usuario = cliente?.usuario.id
        if (!id_usuario) throw new NotFoundException("No se encontro el id")

        const response = await this.usuarioService.desactivateUser(id_usuario)
        return { message: "Usuario desactivado correctamente", affectado: response }
    }

    async getDatosAsesorByAsesoramiento(id: number) {
        const datosAsesor = await this.asesoramientoService.getInfoAsesorbyAsesoramiento(id)
        return datosAsesor
    }

    async getAsesoramientoyDelegado(id_asesor: number) {
        console.log(id_asesor)
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            const delegadoYAsesoria = await this.procesosAsesoriaService.getDelegadoAndIdAsesoramiento(id_asesor, queryRunner.manager)
            await queryRunner.commitTransaction()
            return delegadoYAsesoria
        } catch (err) {
            await queryRunner.rollbackTransaction()
            throw new InternalServerErrorException(`Error ${err.message}`)
        } finally {
            await queryRunner.release()
        }
    }

    async getCredentialsBySector(id: number) {
        const datosAsesor = await this.asesorRepo.findOne({ where: { id }, relations: ['area'] })
        if (!datosAsesor) throw new NotFoundException("No se encontro el asesor")
        console.log(datosAsesor)
        if (['Ingenieria', 'Salud'].includes(datosAsesor.area.nombre)) {
            return {
                "correo": `${String(process.env.S1_EMAIL)}`,
                "client_id": `${String(process.env.S1_CLIENT_ID)}`,
                "client_secret": `${String(process.env.S1_CLIENT_SECRET)}`,
                "client_account_id": `${process.env.S1_ACCOUNT_ID}`
            }
        }
        if (['Negocio', 'Social','Legal'].includes(datosAsesor.area.nombre)) {
            return {
                "correo": `${String(process.env.S2_EMAIL)}`,
                "client_id": `${String(process.env.S2_CLIENT_ID)}`,
                "client_secret": `${String(process.env.S2_CLIENT_SECRET)}`,
                "client_account_id": `${process.env.S2_ACCOUNT_ID}`
            }
        }
        else {
            throw new InternalServerErrorException("no se encuentra esa area")
        }
    }
}
