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

  async listarSegunFecha(id: number, fecha: string, stakeholder: UserRole) {
    // 🔎 Normalizar fecha
    let filtro_fecha: Date;
    if (/^\d{2}-\d{2}-\d{4}$/.test(fecha)) {
      const [day, month, year] = fecha.split('-');
      filtro_fecha = new Date(Number(year), Number(month) - 1, Number(day));
    } else {
      filtro_fecha = new Date(fecha);
    }

    if (isNaN(filtro_fecha.getTime())) {
      console.warn('Fecha inválida:', fecha);
      return [];
    }

    const startOfDay = new Date(filtro_fecha);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(filtro_fecha);
    endOfDay.setHours(23, 59, 59, 999);

    let asesorias: ProcesosAsesoria[] = [];

    if (stakeholder === UserRole.ESTUDIANTE) {
      asesorias = await this.procesosAsesoriaRepo.find({
        where: { cliente: { id } },
        relations: ['asesoramiento'],
      });
    }

    if (stakeholder === UserRole.ASESOR) {
      asesorias = await this.procesosAsesoriaRepo.find({
        where: { asesor: { id } },
        relations: ['asesoramiento'],
      });
    }

    const idsAsesoramiento = asesorias.map((a) => a.asesoramiento.id);
    if (idsAsesoramiento.length === 0) return [];

    const reuniones = await this.reunionRepo.find({
      where: {
        asesoramiento: { id: In(idsAsesoramiento) },
        fecha_reunion: Between(startOfDay, endOfDay),
      },
      relations: ['asesoramiento'],
    });

    const asuntos = await this.asuntoRepo.find({
      where: {
        asesoramiento: { id: In(idsAsesoramiento) },
        fecha_terminado: Between(startOfDay, endOfDay),
      },
      relations: ['asesoramiento'],
    });

    // 🔎 4. Normalizar y unir resultados
    return [
      ...reuniones.map((r) => ({
        tipo: 'reunion',
        titulo: r.titulo,
        fecha: r.fecha_reunion,
        codigo: r.meetingId, // 👈 para que frontend muestre el código 4532498
        enlace_zoom: r.enlace_zoom,
      })),
      ...asuntos.map((a) => ({
        tipo: 'asunto',
        titulo: a.titulo,
        fecha_terminado: a.fecha_terminado,
        estado: a.estado,
      })),
    ];
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
