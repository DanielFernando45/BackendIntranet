import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { TipoTrabajo } from "./entidades/tipoTrabajo.entity";
import { AsuntosService } from "src/asuntos/asuntos.service";
import { ReunionesService } from "src/reuniones/reuniones.service";
import { AsesoramientoService } from "src/asesoramiento/asesoramiento.service";
import { UserRole } from "src/usuario/usuario.entity";
import { TipoContrato } from "./entidades/tipoContrato.entity";


@Injectable()
export class CommonService {
    constructor(
        private readonly asuntoService: AsuntosService,
        private readonly reunionService: ReunionesService,
        private readonly asesoramientoService: AsesoramientoService,

        @InjectDataSource()
        private readonly dataSource: DataSource,

        @InjectRepository(TipoContrato)
        private tipoContratoRepo: Repository<TipoContrato>,
    ) { }

    async listarTiposTrabajo() {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
            const listTrabajos = await queryRunner.manager.find(TipoTrabajo, { select: ['id', 'nombre'] })
            return listTrabajos
        } catch (err) {
            await queryRunner.rollbackTransaction()
            throw new InternalServerErrorException()
        } finally {
            await queryRunner.release()
        }
    }

    async listarTipoContratos() {

        try {
            const listaTipoContratos = await this.tipoContratoRepo.find({ select: ['id', 'nombre'] })
            return listaTipoContratos
        } catch (err) {
            throw new InternalServerErrorException()
        }
    }

    async listarSegunFecha(id: number, fecha: string, stakeholder: UserRole) {
        //const filtro=fecha.split('T')[0]
        const filtro_fecha = new Date(fecha)


        const reuniones = await this.reunionService.getReunionesByFecha(id, filtro_fecha, stakeholder)
        const asuntos = await this.asuntoService.asuntosCalendarioEstudiante(id, filtro_fecha)

        const eventos = reuniones === null ? [...asuntos] : [...reuniones, ...asuntos];

        return eventos;
    }

    async listarTodoEventosAsesor(fecha: string, id_asesor: number, stakeholder: UserRole) {
        const filtro_fecha = new Date(fecha)
        const listAsesoramientos = await this.asesoramientoService.getAsesoramientoByAsesor(id_asesor)

        const reuniones = (await Promise.all(listAsesoramientos.map(async (asesoramiento) => {
            return this.reunionService.getReunionesByFecha(asesoramiento.id, filtro_fecha, stakeholder)
        }))).flat()

        const asuntos = (await Promise.all(listAsesoramientos.map(async (asesoramiento) => {
            return this.asuntoService.asuntosCalendarioAsesor(asesoramiento.id, filtro_fecha)
        }))).flat()

        if (asuntos.every(item => item === null) && reuniones.every(item => item === null)) return { "message": "No hay eventos concertados" }

        if (asuntos.length === 0) return reuniones;

        if (reuniones.length === 0) return asuntos;

        return [...reuniones, ...asuntos];
    }

}