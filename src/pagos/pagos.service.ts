import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { estadoPago, Pago } from './entities/pago.entity';
import { DataSource, Repository } from 'typeorm';
import {
  Informacion_Pagos,
  tipoPago,
  tipoServicio,
} from './entities/informacion_pagos.entity';
import { CreatePagoAlContadoDto } from './dto/create-pago-al-contado.dto';
import { PagoPorCuotaWrpDTO } from './dto/pago-por-cuotas-add.dto';
import { UpdateCuotasDto } from './dto/cuotas-update.dto';
import { UpdatePagoContadoDto } from './dto/update-pago.dto';
import { listServiciosDto } from './dto/listDtos/list-servicios.dto';
import { ClienteService } from 'src/cliente/cliente.service';
import { listPagosEstudianteDto } from './dto/listDtos/list-pagos-estudiante.dto';
import { listPagosAdminDto } from './dto/listDtos/list-pagos-admin.dto';

@Injectable()
export class PagosService {
  constructor(
    private readonly clienteService: ClienteService,

    @InjectRepository(Pago)
    private pagoRepo: Repository<Pago>,

    @InjectRepository(Informacion_Pagos)
    private informacionRepo: Repository<Informacion_Pagos>,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async contadoYotrosServicios(
    createPagoDto: CreatePagoAlContadoDto,
    tipo_servicio: tipoServicio,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let newPago;

      if (tipo_servicio === tipoServicio.ASESORIA) {
        const newInfopago = queryRunner.manager.create(Informacion_Pagos, {
          titulo: 'Pago total',
          pago_total: createPagoDto.pago_total,
          numero_cuotas: 1,
          fecha_creado: new Date(),
          tipo_pago: tipoPago.CONTADO,
          tipo_servicio: tipo_servicio,
          asesoramiento: { id: createPagoDto.id_asesoramiento },
        });

        const { id } = await queryRunner.manager.save(newInfopago);
        newPago = queryRunner.manager.create(Pago, {
          nombre: 'Pago total',
          fecha_pago: createPagoDto.fecha_pago,
          estado_pago: estadoPago.PAGADO,
          monto: createPagoDto.pago_total,
          informacion_pago: { id },
        });
      }
      if (tipo_servicio === tipoServicio.OTROS) {
        const newInfopago = queryRunner.manager.create(Informacion_Pagos, {
          titulo: createPagoDto.titulo,
          pago_total: createPagoDto.pago_total,
          numero_cuotas: 1,
          fecha_creado: new Date(),
          tipo_pago: tipoPago.CONTADO,
          tipo_servicio: tipo_servicio,
          asesoramiento: { id: createPagoDto.id_asesoramiento },
        });

        const { id } = await queryRunner.manager.save(newInfopago);
        newPago = queryRunner.manager.create(Pago, {
          nombre: createPagoDto.titulo,
          fecha_pago: createPagoDto.fecha_pago,
          estado_pago: estadoPago.PAGADO,
          monto: createPagoDto.pago_total,
          informacion_pago: { id },
        });
      }
      await queryRunner.manager.save(newPago);
      await queryRunner.commitTransaction();
      return 'Pago agregado correctamente';
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return new InternalServerErrorException(
        `Error al intentar crear el pago ${err.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async listarContratosAlContado() {
    const listar = await this.dataSource.query(`
    SELECT 
      con.id AS id_contrato,
      t.nombre AS trabajo_investigacion,
      CONCAT(c.nombre, ' ', c.apellido) AS delegado,
      con.fecha_inicio AS fecha_registro,
      con.modalidad AS modalidad,
      tp.nombre AS tipo_pago,
      a.profesion_asesoria,
      a.id AS id_asesoramiento,
      COUNT(CASE WHEN pg.estado_pago = 1 THEN 1 END) AS pagos_confirmados
    FROM contrato con
      INNER JOIN asesoramiento a ON a.id = con.id_asesoramiento
      INNER JOIN tipo_trabajo t ON con.id_tipoTrabajo = t.id
      INNER JOIN procesos_asesoria p ON a.id = p.id_asesoramiento
      INNER JOIN cliente c ON p.id_cliente = c.id 
      INNER JOIN tipo_pago tp ON con.id_tipoPago = tp.id
      LEFT JOIN informacion_pagos ip ON ip.id_asesoramiento = a.id
      LEFT JOIN pago pg ON pg.id_informacion_pago = ip.id
    WHERE p.esDelegado = true
      AND con.id_tipoPago = 1   -- "al contado"
    GROUP BY con.id, t.nombre, c.nombre, c.apellido, con.fecha_inicio,
             con.modalidad, tp.nombre, a.profesion_asesoria, a.id
    HAVING COUNT(CASE WHEN pg.estado_pago = 1 THEN 1 END) = 0
  `);
    return listar;
  }

  async listarContratosACuotas() {
    const listar = await this.dataSource.query(`
    SELECT 
      con.id AS id_contrato,
      t.nombre AS trabajo_investigacion,
      CONCAT(c.nombre, ' ', c.apellido) AS delegado,
      con.fecha_inicio AS fecha_registro,
      con.modalidad AS modalidad,
      tp.nombre AS tipo_pago,
      a.profesion_asesoria,
      a.id AS id_asesoramiento,
      COALESCE(ip.numero_cuotas, 0) AS numero_cuotas,
      COUNT(CASE WHEN pg.estado_pago = 1 THEN 1 END) AS pagos_confirmados
    FROM contrato con
      INNER JOIN asesoramiento a ON a.id = con.id_asesoramiento
      INNER JOIN tipo_trabajo t ON con.id_tipoTrabajo = t.id
      INNER JOIN procesos_asesoria p ON a.id = p.id_asesoramiento
      INNER JOIN cliente c ON p.id_cliente = c.id 
      INNER JOIN tipo_pago tp ON con.id_tipoPago = tp.id
      LEFT JOIN informacion_pagos ip ON ip.id_asesoramiento = a.id
      LEFT JOIN pago pg ON pg.id_informacion_pago = ip.id
    WHERE p.esDelegado = true
      AND con.id_tipoPago = 2   -- "a cuotas"
    GROUP BY con.id, t.nombre, c.nombre, c.apellido, con.fecha_inicio,
             con.modalidad, tp.nombre, a.profesion_asesoria, a.id, ip.numero_cuotas
    HAVING COUNT(CASE WHEN pg.estado_pago = 1 THEN 1 END) = 0
  `);
    return listar;
  }

  async post_pago_por_cuotas(createPagoDto: PagoPorCuotaWrpDTO) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const infoValues = createPagoDto.createPagoPorCuotas;
    const pagosValues = createPagoDto.cuotas;

    try {
      // Crear la información del pago
      const newInfopago = queryRunner.manager.create(Informacion_Pagos, {
        titulo: 'Pago por cuotas',
        pago_total: infoValues.pago_total,
        numero_cuotas: infoValues.numero_cuotas,
        fecha_creado: new Date(),
        tipo_pago: tipoPago.CUOTAS,
        tipo_servicio: tipoServicio.ASESORIA,
        asesoramiento: { id: infoValues.id_asesoramiento }, // Aquí usamos el id_asesoramiento recibido del controlador
      });
      const { id } = await queryRunner.manager.save(newInfopago);

      // Crear el pago de la primera cuota
      const pago1 = queryRunner.manager.create(Pago, {
        nombre: 'Cuota 1',
        monto: pagosValues.monto1,
        estado_pago: estadoPago.PAGADO,
        fecha_pago: pagosValues.fecha_pago1,
        informacion_pago: { id },
      });
      await queryRunner.manager.save(pago1);

      // Crear el pago de la segunda cuota
      const pago2 = queryRunner.manager.create(Pago, {
        nombre: 'Cuota 2',
        monto: pagosValues.monto2,
        estado_pago: estadoPago.POR_PAGAR,
        informacion_pago: { id },
      });
      await queryRunner.manager.save(pago2);

      // Si hay una tercera cuota y se especifican 3 cuotas, crear el pago para la tercera cuota
      if (pagosValues.monto3 && infoValues.numero_cuotas === 3) {
        const pago3 = queryRunner.manager.create(Pago, {
          nombre: 'Cuota 3',
          monto: pagosValues.monto3,
          estado_pago: estadoPago.POR_PAGAR,
          informacion_pago: { id },
        });
        await queryRunner.manager.save(pago3);

        // Validar que la suma de las tres cuotas sea igual al pago total
        if (pago1.monto + pago2.monto + pago3.monto !== infoValues.pago_total)
          throw new BadRequestException('Las cuotas deben sumar el pago total');
      } else {
        // Si no hay tercera cuota, validar que la suma de las dos cuotas sea igual al pago total
        if (pago1.monto + pago2.monto !== infoValues.pago_total)
          throw new BadRequestException('Las cuotas deben sumar el pago total');
      }

      // Confirmar la transacción si todo ha ido bien
      await queryRunner.commitTransaction();
      return 'Agregados los pagos por cuotas satisfactoriamente';
    } catch (err) {
      // Hacer rollback en caso de error
      await queryRunner.rollbackTransaction();
      return new InternalServerErrorException(
        `Error al realizar el pago por cuotas ${err.message}`,
      );
    } finally {
      // Liberar el query runner después de terminar
      await queryRunner.release();
    }
  }

  async updateContado(id: number, body: UpdatePagoContadoDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pago = await queryRunner.manager.findOneOrFail(Pago, {
        where: { informacion_pago: { id } },
      });
      if (body.pago_total) pago.monto = body.pago_total;
      if (body.fecha_pago) pago.fecha_pago = body.fecha_pago;

      await queryRunner.manager.save(pago);

      await queryRunner.commitTransaction();
      return `Se modifico correctamente el pago al contado`;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `No se puedo actulizar el pago al contado error:${err.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updateCuotas(id: number, updateCuotasDto: UpdateCuotasDto) {
    const cuotas = await this.pagoRepo.find({
      where: { informacion_pago: { id } },
    });
    if (!cuotas.length)
      throw new NotFoundException(`No se encontraron cuotas para ese Id:${id}`);
    const monto_total = cuotas.reduce(
      (acumulador, valorActual) => acumulador + valorActual.monto,
      0,
    );

    for (let i = 0; i < cuotas.length; i++) {
      //updateCuotasDto[`nombre${i+1}`] && (cuotas[i].nombre=updateCuotasDto[`nombre${i+1}`])
      updateCuotasDto[`monto${i + 1}`] &&
        (cuotas[i].monto = updateCuotasDto[`monto${i + 1}`]);
      if (updateCuotasDto[`fecha_pago${i + 1}`]) {
        cuotas[i].fecha_pago = updateCuotasDto[`fecha_pago${i + 1}`];
        cuotas[i].estado_pago = estadoPago.PAGADO;
      }
    }
    const nuevo_total = cuotas.reduce(
      (acumulador, valorActual) => acumulador + valorActual.monto,
      0,
    );
    if (monto_total !== nuevo_total)
      throw new BadRequestException(
        'El monto de las cuotas debe ser igual al monto total',
      );
    await this.pagoRepo.save(cuotas);
    return `Se actualizaron las cuotas`;
  }

  async updateOtroServicios(id: number, body: UpdatePagoContadoDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const infoPago = await queryRunner.manager.findOne(Informacion_Pagos, {
        where: { id, tipo_servicio: tipoServicio.OTROS },
        relations: ['asesoramiento'],
      });
      if (infoPago === null)
        throw new NotFoundException('No se encontro un servicio de tipo otros');

      const pago = await queryRunner.manager.findOneByOrFail(Pago, {
        informacion_pago: { id },
      });

      if (body.fecha_pago && body.pago_total && body.titulo) {
        infoPago.pago_total = body.pago_total;
        infoPago.titulo = body.titulo;
      }
      if (body.pago_total) pago.monto = body.pago_total;
      if (body.fecha_pago) pago.fecha_pago = body.fecha_pago;
      if (body.titulo) pago.nombre = body.titulo;

      await queryRunner.manager.save(infoPago);
      await queryRunner.manager.save(pago);

      await queryRunner.commitTransaction();
      return 'Actualizado satisfactoriamente';
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return err.message;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllServicios(): Promise<listServiciosDto[]> {
    const infoServicios = await this.informacionRepo
      .createQueryBuilder('i')
      .innerJoinAndSelect('i.asesoramiento', 'a')
      .innerJoinAndSelect('i.pagos', 'p')
      .select([
        'i.id AS id',
        'a.id AS idAsesoramiento',
        'i.titulo AS titulo',
        'i.pago_total AS pago_total',
        'p.fecha_pago AS fecha_pago',
      ])
      .where('i.tipo_servicio=:tipo_servicio', {
        tipo_servicio: tipoServicio.OTROS,
      })
      .getRawMany();

    const response = await Promise.all(
      infoServicios.map(async (info) => {
        let delegado = await this.clienteService.getDelegado(
          info.idAsesoramiento,
        );
        return {
          id: info.id,
          delegado: `${delegado.nombre_delegado}`,
          titulo: info.titulo,
          pago_total: info.pago_total,
          fecha_pago: info.fecha_pago,
        };
      }),
    );
    return response;
  }

  async deletePago(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const deletedPagos = await queryRunner.manager.delete(Pago, {
        informacion_pago: { id },
      });
      if (deletedPagos.affected === 0)
        throw new NotFoundException(`No se encontro pagos con el id: ${id}`);
      const deletedInfo = await queryRunner.manager.delete(Informacion_Pagos, {
        id,
      });
      if (deletedInfo.affected === 0)
        throw new NotFoundException(
          `No hay informacion de pago con ese id: ${id}`,
        );

      await queryRunner.commitTransaction();
      return `Eliminado satisfactoriamente`;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `No se realizo la eliminacion pedida ${err.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getPagosCuotas(tipo: tipoPago) {
    const datosPago = await this.informacionRepo.find({
      where: { tipo_pago: tipo },
      relations: ['asesoramiento', 'pagos'],
      select: ['id', 'asesoramiento'],
    });

    const listPagos = await Promise.all(
      datosPago.map(async (pago) => {
        let delegado = await this.clienteService.getDelegado(
          pago.asesoramiento.id,
        );
        if (!delegado) throw new NotFoundException();
        return {
          id_infopago: pago.id,
          delegado: delegado.nombre_delegado,
          contrato: tipo,
          pagos: pago.pagos.reverse(),
        };
      }),
    );

    return listPagos;
  }

  async getPagosByTipo(tipo: tipoPago): Promise<listPagosAdminDto[]> {
    const datosPago = await this.informacionRepo.find({
      where: { tipo_pago: tipo, tipo_servicio: tipoServicio.ASESORIA },
      relations: ['asesoramiento'],
      select: ['id', 'asesoramiento'],
    });

    const listPagos = await Promise.all(
      datosPago.map(async (pago) => {
        let delegado = await this.clienteService.getDelegado(
          pago.asesoramiento.id,
        );
        let lastPago = await this.getUltimoPago(pago.id);
        if (!delegado)
          throw new NotFoundException('Error en conseguir el delegado');
        return {
          id_infoPago: pago.id,
          delegado: delegado.nombre_delegado,
          contrato: tipo,
          fecha_ultimo_pago: lastPago.fecha_pago,
          ultimo_monto: lastPago.monto,
        };
      }),
    );
    return listPagos;
  }

  async getUltimoPago(id: number) {
    const lastPago = await this.pagoRepo.find({
      where: { informacion_pago: { id } },
      order: { fecha_pago: 'DESC' },
      take: 1,
    });
    return lastPago[0];
  }

  async listPagosByAsesoramiento(
    id: number,
    tipo_servicio: tipoServicio,
  ): Promise<listPagosEstudianteDto[]> {
    const listPagos: listPagosEstudianteDto[] = await this.informacionRepo
      .createQueryBuilder('inf')
      .leftJoin('inf.asesoramiento', 'ase')
      .innerJoinAndSelect('inf.pagos', 'pagos')
      .select([
        'pagos.nombre AS titulo',
        'pagos.monto AS monto',
        'pagos.fecha_pago AS fecha_pago',
        'pagos.estado_pago AS estado_pago',
      ])
      .where('inf.tipo_servicio= :tipoServicio', {
        tipoServicio: tipo_servicio,
      })
      .andWhere('ase.id= :id', { id })
      .getRawMany();

    return listPagos;
  }
}
