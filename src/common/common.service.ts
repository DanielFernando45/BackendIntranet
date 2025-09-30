import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, In, Repository } from 'typeorm';
import { TipoTrabajo } from './entidades/tipoTrabajo.entity';
import { AsuntosService } from 'src/asuntos/asuntos.service';
import { ReunionesService } from 'src/reuniones/reuniones.service';
import { AsesoramientoService } from 'src/asesoramiento/asesoramiento.service';
import { UserRole } from 'src/usuario/usuario.entity';
import { TipoContrato } from './entidades/tipoContrato.entity';
import { ProcesosAsesoria } from 'src/procesos_asesoria/entities/procesos_asesoria.entity';
import { Asunto } from 'src/asuntos/entities/asunto.entity';
import { Reunion } from 'src/reuniones/entities/reunion.entity';
import { Contrato } from 'src/contrato/entities/contrato.entity';

@Injectable()
export class CommonService {
  constructor(
    private readonly asuntoService: AsuntosService,
    private readonly reunionService: ReunionesService,
    private readonly asesoramientoService: AsesoramientoService,

    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Asunto)
    private asuntoRepo: Repository<Asunto>,

    @InjectRepository(Reunion)
    private reunionRepo: Repository<Reunion>,
    @InjectRepository(Contrato)
    private contratoRepo: Repository<Contrato>,

    @InjectRepository(ProcesosAsesoria)
    private procesosAsesoriaRepo: Repository<ProcesosAsesoria>,
    @InjectRepository(TipoContrato)
    private tipoContratoRepo: Repository<TipoContrato>,
  ) {}

  async listarTiposTrabajo() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const listTrabajos = await queryRunner.manager.find(TipoTrabajo, {
        select: ['id', 'nombre'],
      });
      return listTrabajos;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  async listarTipoContratos() {
    try {
      const listaTipoContratos = await this.tipoContratoRepo.find({
        select: ['id', 'nombre'],
      });
      return listaTipoContratos;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
  async listarPorAsesoramiento(idAsesoramiento: number, stakeholder: UserRole) {
    // El rol puede servir más adelante para lógica personalizada,
    // pero no afecta qué eventos se traen directamente

    const reuniones = await this.reunionRepo.find({
      where: { asesoramiento: { id: idAsesoramiento } },
      relations: ['asesoramiento'],
    });

    const contratos = await this.contratoRepo.find({
      where: { asesoramiento: { id: idAsesoramiento } },
      relations: ['asesoramiento'],
    });

    const asuntos = await this.asuntoRepo.find({
      where: { asesoramiento: { id: idAsesoramiento } },
      relations: ['asesoramiento'],
    });

    return {
      reuniones: reuniones.map((r) => ({
        id: r.id,
        titulo: r.titulo,
        fecha: r.fecha_reunion,
        enlace_zoom: r.enlace_zoom,
      })),
      contratos: contratos.map((c) => ({
        id: c.id,
        servicio: c.servicio,
        modalidad: c.modalidad,
        fecha_inicio: c.fecha_inicio,
        fecha_fin: c.fecha_fin,
      })),
      asuntos: asuntos.map((a) => ({
        id: a.id,
        titulo: a.titulo,
        estado: a.estado,
        fecha_entregado: a.fecha_entregado,
        fecha_revision: a.fecha_revision,
        fecha_estimada: a.fecha_estimada,
        fecha_terminado: a.fecha_terminado,
      })),
    };
  }

  async listarTodoEventosAsesor(
    fecha: string,
    id_asesor: number,
    stakeholder: UserRole,
  ) {
    const filtro_fecha = new Date(fecha);
    const listAsesoramientos =
      await this.asesoramientoService.getAsesoramientoByAsesor(id_asesor);

    const reuniones = (
      await Promise.all(
        listAsesoramientos.map(async (asesoramiento) => {
          return this.reunionService.getReunionesByFecha(
            asesoramiento.id,
            filtro_fecha,
            stakeholder,
          );
        }),
      )
    ).flat();

    const asuntos = (
      await Promise.all(
        listAsesoramientos.map(async (asesoramiento) => {
          return this.asuntoService.asuntosCalendarioAsesor(
            asesoramiento.id,
            filtro_fecha,
          );
        }),
      )
    ).flat();

    if (
      asuntos.every((item) => item === null) &&
      reuniones.every((item) => item === null)
    )
      return { message: 'No hay eventos concertados' };

    if (asuntos.length === 0) return reuniones;

    if (reuniones.length === 0) return asuntos;

    return [...reuniones, ...asuntos];
  }
}
