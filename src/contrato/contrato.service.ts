import { Injectable } from '@nestjs/common';
import { Asesoramiento } from 'src/asesoramiento/entities/asesoramiento.entity';
import { Repository } from 'typeorm';
import { Contrato } from './entities/contrato.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ContratoService {

    private readonly asesoramientoRepo: Repository<Asesoramiento>
    @InjectRepository(Contrato)
    private readonly contratoRepo: Repository<Contrato>

    // contratoDelAsesoramiento
    async contratoByAsesoramiento(id: string) {
        const findFechasContrato = await this.contratoRepo.createQueryBuilder('contrato')
            .select('contrato.fecha_inicio')
            .innerJoinAndSelect('contrato.tipoPago', 'tip')
            .where('contrato.id = :idContrato', { idContrato: id })
            .getRawOne()

        return findFechasContrato;
    }

}
