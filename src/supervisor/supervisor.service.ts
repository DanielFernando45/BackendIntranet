import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Supervisor } from './entities/supervisor.entity';
import { Repository } from 'typeorm';
import { AreaService } from 'src/area/area.service';
import { Area } from 'src/area/entities/area.entity';

@Injectable()
export class SupervisorService {

    constructor(

        private readonly areaService: AreaService,

        @InjectRepository(Supervisor)
        private supervisorRepo: Repository<Supervisor>,
        @InjectRepository(Area)
        private areaRepo: Repository<Area>,
    ) { }


    async getAreaBySupervisor(id: string) {

        const areas = await this.areaRepo.find({
            where: { supervisor: { id } },
        })

        if (areas.length === 0) throw new Error("El supervisor no tiene áreas asignadas");
        return areas;
    }
}
