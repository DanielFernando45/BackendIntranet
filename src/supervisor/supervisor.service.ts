import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Supervisor } from './entities/supervisor.entity';
import { Repository, In , Not } from 'typeorm';
import { AreaService } from 'src/area/area.service';
import { Area } from 'src/area/entities/area.entity';
import { createSupervisorDto } from './dto/crear-supervisor.dto';
import { CreateUserDto } from 'src/usuario/dto/create-user.dto';
import { UserRole } from 'src/usuario/usuario.entity';
import { UsuarioService } from 'src/usuario/usuario.service';

@Injectable()
export class SupervisorService {

    constructor(
        private readonly usuarioService: UsuarioService,
        private readonly areaService: AreaService,

        @InjectRepository(Supervisor)
        private supervisorRepo: Repository<Supervisor>,

        @InjectRepository(Area)
        private areaRepo: Repository<Area>,

    ) { }

    async createSupervisor(data: createSupervisorDto) {

        const exist = await this.supervisorRepo.findOneBy({ email: data.email })

        if (exist) throw new Error("El email ya está en uso")

        const dataUser = {
            username: data.email,
            password: data.dni,
            role: UserRole.SUPERVISOR,
            estado: true
        }

        const savedUser = await this.usuarioService.createUserDefault(dataUser)

        try {
            const supervisor = this.supervisorRepo.create({
                ...data,
                usuario: savedUser
            })

            const savedSupervisor = await this.supervisorRepo.save(supervisor);

            if (data.areasIds && data.areasIds.length > 0) {
                await this.assignAreasToSupervisor(savedSupervisor.id, data.areasIds);
            }

            return {
                ...savedSupervisor,
                areas: data.areasIds || []
            }

        }
        catch (error) {
            await this.usuarioService.deleteUserWithCliente(savedUser.id, this.supervisorRepo.manager)
            throw new BadRequestException(error.message || "Errror al crear Supervisor")
        }
    }

    async assignAreasToSupervisor(supervisorId: string, areasIds: string[]) {
        // 1. Verificar que las áreas existan
        const areas = await this.areaRepo.find({
            where: { id: In(areasIds) }
        });

        if (areas.length !== areasIds.length) {
            throw new BadRequestException("Algunas áreas no existen");
        }

        // 2. Verificar que las áreas NO estén asignadas a otro supervisor
        const areasAlreadyAssigned = await this.areaRepo.find({
            where: {
                id: In(areasIds),
                supervisor: { id: Not(supervisorId) } // áreas con supervisor distinto
            },
            relations: ['supervisor']
        });

        if (areasAlreadyAssigned.length > 0) {
            const ids = areasAlreadyAssigned.map(a => a.id).join(', ');
            throw new BadRequestException(`Las áreas [${ids}] ya están asignadas a otro supervisor`);
        }

        // 3. Actualizar las áreas con el nuevo supervisor
        for (const area of areas) {
            area.supervisor = { id: supervisorId } as Supervisor;
            await this.areaRepo.save(area);
        }

        return areas;
    }


    // Método para desasignar áreas del supervisor
    async unassignAreasFromSupervisor(supervisorId: string, areasIds: string[]) {
        const areas = await this.areaRepo.find({
            where: {
                id: In(areasIds),
                supervisor: { id: supervisorId }
            }
        });

        for (const area of areas) {
            area.supervisor = null;
            await this.areaRepo.save(area);
        }

        return areas;
    }

    async getAreaBySupervisor(id: string) {
        const areas = await this.areaRepo.find({
            where: { supervisor: { id } },
            relations: ['supervisor']
        });

        if (areas.length === 0) throw new BadRequestException("El supervisor no tiene áreas asignadas");
        return areas;
    }

    // Método para obtener supervisor con sus áreas
    async getSupervisorWithAreas(id: string) {
        const supervisor = await this.supervisorRepo.findOne({
            where: { id },
            relations: ['area', 'usuario']
        });

        if (!supervisor) throw new BadRequestException("Supervisor no encontrado");
        return supervisor;
    }


}
