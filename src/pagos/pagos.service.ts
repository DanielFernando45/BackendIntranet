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
  ) { }

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
      // Validar que el número de cuotas esté entre 2 y 6
      if (infoValues.numero_cuotas < 2 || infoValues.numero_cuotas > 6) {
        throw new BadRequestException('El número de cuotas debe estar entre 2 y 6');
      }

      // Crear la información del pago
      const newInfopago = queryRunner.manager.create(Informacion_Pagos, {
        titulo: 'Pago por cuotas',
        pago_total: infoValues.pago_total,
        numero_cuotas: infoValues.numero_cuotas,
        fecha_creado: new Date(),
        tipo_pago: tipoPago.CUOTAS,
        tipo_servicio: tipoServicio.ASESORIA,
        asesoramiento: { id: infoValues.id_asesoramiento },
      });

      const { id } = await queryRunner.manager.save(newInfopago);

      // Array para almacenar los montos de las cuotas - ESPECIFICAR EL TIPO
      const montosCuotas: number[] = [];

      // Array para almacenar las cuotas adicionales - ESPECIFICAR EL TIPO
      const cuotasAdicionales: Pago[] = [];

      // Crear la primera cuota (siempre existe y está pagada)
      const pago1 = queryRunner.manager.create(Pago, {
        nombre: 'Cuota 1',
        monto: pagosValues.monto1,
        estado_pago: estadoPago.PAGADO,
        fecha_pago: pagosValues.fecha_pago1,
        informacion_pago: { id },
      });
      await queryRunner.manager.save(pago1);
      montosCuotas.push(pago1.monto);

      // Crear la segunda cuota (siempre existe)
      const pago2 = queryRunner.manager.create(Pago, {
        nombre: 'Cuota 2',
        monto: pagosValues.monto2,
        estado_pago: estadoPago.POR_PAGAR,
        informacion_pago: { id },
      });
      await queryRunner.manager.save(pago2);
      montosCuotas.push(pago2.monto);

      // Crear cuotas adicionales según el número seleccionado
      for (let i = 3; i <= infoValues.numero_cuotas; i++) {
        const montoKey = `monto${i}` as keyof typeof pagosValues;

        // Validar que exista el monto para esta cuota
        if (!pagosValues[montoKey]) {
          throw new BadRequestException(`El monto de la cuota ${i} es requerido`);
        }

        const pago = queryRunner.manager.create(Pago, {
          nombre: `Cuota ${i}`,
          monto: pagosValues[montoKey] as number,
          estado_pago: estadoPago.POR_PAGAR,
          informacion_pago: { id },
        });

        await queryRunner.manager.save(pago);
        montosCuotas.push(pago.monto);
        cuotasAdicionales.push(pago);
      }

      // Validar que la suma de todas las cuotas sea igual al pago total
      const sumaCuotas = montosCuotas.reduce((acc, monto) => acc + monto, 0);

      if (Math.abs(sumaCuotas - infoValues.pago_total) > 0.01) { // Tolerancia para errores de redondeo
        throw new BadRequestException(
          `La suma de las cuotas (${sumaCuotas}) debe ser igual al pago total (${infoValues.pago_total})`
        );
      }

      // Confirmar la transacción si todo ha ido bien
      await queryRunner.commitTransaction();
      return 'Agregados los pagos por cuotas satisfactoriamente';

    } catch (err) {
      // Hacer rollback en caso de error
      await queryRunner.rollbackTransaction();

      if (err instanceof BadRequestException) {
        throw err;
      }

      throw new InternalServerErrorException(
        `Error al realizar el pago por cuotas: ${err.message}`,
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar la información del pago
      const infoPago = await queryRunner.manager.findOne(Informacion_Pagos, {
        where: { id },
      });

      if (!infoPago) {
        throw new NotFoundException(`No se encontró información de pago con ID: ${id}`);
      }

      // Buscar todas las cuotas asociadas
      let cuotas = await queryRunner.manager.find(Pago, {
        where: { informacion_pago: { id } },
        order: { id: 'ASC' }
      });

      if (!cuotas.length) {
        throw new NotFoundException(`No se encontraron cuotas para el pago ID: ${id}`);
      }

      // Determinar el número actual de cuotas basado en las cuotas existentes
      const numeroCuotasActual = cuotas.length;

      // Verificar si necesitamos cambiar el número de cuotas
      // Esto se determina por la cantidad de montos recibidos en el DTO
      const montosRecibidos : number[]=[];
      for (let i = 1; i <= 6; i++) {
        if (updateCuotasDto[`monto${i}`] !== undefined) {
          montosRecibidos.push(i);
        }
      }

      // Si recibimos más montos que cuotas actuales, necesitamos agregar cuotas
      if (montosRecibidos.length > 0) {
        const maxCuotaRecibida = Math.max(...montosRecibidos);

        if (maxCuotaRecibida > numeroCuotasActual) {
          // Necesitamos agregar más cuotas
          const nuevasCuotasNecesarias = maxCuotaRecibida - numeroCuotasActual;

          for (let i = 0; i < nuevasCuotasNecesarias; i++) {
            const nuevoNumero = numeroCuotasActual + i + 1;
            const nuevaCuota = queryRunner.manager.create(Pago, {
              nombre: `Cuota ${nuevoNumero}`,
              monto: 0,
              estado_pago: estadoPago.POR_PAGAR,
              informacion_pago: { id },
            });
            const cuotaGuardada = await queryRunner.manager.save(nuevaCuota);
            cuotas.push(cuotaGuardada);
          }

          // Actualizar el número de cuotas en infoPago
          infoPago.numero_cuotas = cuotas.length;
          await queryRunner.manager.save(infoPago);
        }
      }

      // Actualizar cada cuota con los valores del DTO
      for (let i = 0; i < cuotas.length; i++) {
        const numCuota = i + 1;
        const montoKey = `monto${numCuota}`;
        const fechaKey = `fecha_pago${numCuota}`;

        // Actualizar monto si viene en el DTO
        if (updateCuotasDto[montoKey] !== undefined) {
          cuotas[i].monto = updateCuotasDto[montoKey];
        }

        // Actualizar fecha y estado si viene fecha en el DTO
        if (updateCuotasDto[fechaKey]) {
          cuotas[i].fecha_pago = updateCuotasDto[fechaKey];
          cuotas[i].estado_pago = estadoPago.PAGADO;
        }
      }

      // Validar suma total
      const nuevo_total = cuotas.reduce((acc, curr) => acc + curr.monto, 0);

      if (Math.abs(nuevo_total - infoPago.pago_total) > 0.01) {
        throw new BadRequestException(
          `La suma de las cuotas (${nuevo_total}) debe ser igual al pago total (${infoPago.pago_total})`
        );
      }

      await queryRunner.manager.save(cuotas);
      await queryRunner.commitTransaction();

      return {
        message: 'Cuotas actualizadas correctamente',
        data: {
          id_pago: id,
          numero_cuotas: cuotas.length,
          total: nuevo_total,
          cuotas: cuotas.map(c => ({
            nombre: c.nombre,
            monto: c.monto,
            estado: c.estado_pago,
            fecha_pago: c.fecha_pago
          }))
        }
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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
