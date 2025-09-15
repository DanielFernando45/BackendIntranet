import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAsesoramientoDto } from './dto/create-asesoramiento.dto';
import { UpdateAsesoramientoDto } from './dto/update-asesoramiento.dto';
import { ProcesosAsesoriaService } from 'src/procesos_asesoria/procesos_asesoria.service';
import {
  Asesoramiento,
  Estado_Asesoria,
} from './entities/asesoramiento.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, QueryRunner } from 'typeorm';
import { clientesExtraDTO } from 'src/procesos_asesoria/dto/clientes_extra.dto';
import { DatosAsesoramientoDto } from 'src/cliente/dto/listar-clientes.dto';
import { ProcesosAsesoria } from 'src/procesos_asesoria/entities/procesos_asesoria.entity';
import { ClienteService } from 'src/cliente/cliente.service';
import { listAsesoramientoYDelegadoDto } from './dto/list-asesoramiento-delegado.dto';
import { Contrato } from 'src/contrato/entities/contrato.entity';

@Injectable()
export class AsesoramientoService {
  constructor(
    private readonly procesosAsesoriaService: ProcesosAsesoriaService,
    // private readonly tipoTrabajoService: TipoTrabajoService

    @Inject(forwardRef(() => ClienteService))
    private readonly clienteService: ClienteService,

    @InjectRepository(Asesoramiento)
    private asesoramientoRepo: Repository<Asesoramiento>,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) { }

  async create(
    createAsesoramientoDto: CreateAsesoramientoDto,
    clientes: clientesExtraDTO,
  ) {
    const {
      id_asesor,
      profesion_asesoria,
      tipo_servicio,
      fecha_inicio,
      fecha_fin,
      id_contrato,
      id_tipo_trabajo,
    } = createAsesoramientoDto;

    if (
      !fecha_inicio ||
      !fecha_fin ||
      isNaN(fecha_inicio.getTime()) ||
      isNaN(fecha_fin.getTime())
    ) {
      throw new BadRequestException('Fechas inválidas');
    }
    if (!id_tipo_trabajo || !id_contrato)
      throw new BadRequestException(
        'No se encontro el tipo de trabajo y contrato',
      );
    if (fecha_fin < fecha_inicio) {
      throw new BadRequestException(
        'La fecha de fin no puede ser anterior a la fecha de inicio',
      );
    }

    if (!id_asesor || typeof id_asesor !== 'number') {
      throw new BadRequestException('ID de asesor inválido');
    }
    const clienteIds = Object.values(clientes).filter(
      (id) => typeof id === 'string',
    );

    if (clienteIds.length === 0) {
      throw new BadRequestException(
        'Debe proporcionar al menos un cliente válido',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newAsesoramiento = queryRunner.manager.create(Asesoramiento, {
        fecha_inicio,
        profesion_asesoria,
        tipo_servicio,
        fecha_fin,
        tipoTrabajo: { id: id_tipo_trabajo },
        tipoContrato: { id: id_contrato },
        estado: Estado_Asesoria.ACTIVO,
        especialidad: createAsesoramientoDto.especialidad ?? null,
      });

      const addedAsesoramiento =
        await queryRunner.manager.save(newAsesoramiento);
      const id_asesoramiento = addedAsesoramiento.id;

      const creacion =
        await this.procesosAsesoriaService.addProceso_to_Asesoramiento(
          clientes,
          id_asesor,
          id_asesoramiento,
          queryRunner.manager,
        );

      await queryRunner.commitTransaction();
      return 'Agregado satisfactoriamente';
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error(
        'Error al agregar se revertira la transaccion',
        err.message,
      );
      throw new InternalServerErrorException(
        'Transacción fallida: ' + err.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findDatesByCliente(id: number): Promise<any> {
    const datosAsesoramiento = await this.asesoramientoRepo
      .createQueryBuilder('a') // Alias para la tabla asesoramiento
      .innerJoin('a.procesosasesoria', 'p') // Relación con la tabla procesos_asesoria
      .innerJoin('p.cliente', 'c') // Relación con la tabla cliente
      .leftJoinAndSelect('a.tipoContrato', 'tc')
      .select(['a.fecha_inicio', 'a.fecha_fin', 'tc.id', 'tc.nombre']) // Selecciona las columnas que deseas
      .where('c.id = :id', { id })
      .getOne();

    // const solo_fechas = {
    //   contrato: datosAsesoramiento
    //     ? {
    //         id: datosAsesoramiento.tipoContrato.id,
    //         // nombre: datosAsesoramiento.tipoContrato.nombre,
    //       }
    //     : { message: 'Por asignar' },
    //   fecha_inicio: datosAsesoramiento
    //     ? "Sin fecha"
    //     : 'Por asignar',
    //   fecha_fin: datosAsesoramiento
    //     ? "Sin fecha"
    //     : 'Por asignar',
    // };
    return datosAsesoramiento;
  }

  async changeAsesoramiento(id: number, cambios: UpdateAsesoramientoDto) {
    // if (!Object.keys(cambios).length)
    //   throw new BadRequestException('No se envio un body para actualizar');

    // const partialEntity: any = { ...cambios };

    // const updateAsesoramiento = await this.asesoramientoRepo.update(
    //   id,
    //   cambios,
    // );
    // if (updateAsesoramiento.affected === 0)
    //   throw new NotFoundException('No hay registro a afectar');
    // return `Se cambio el asesor correctamente por el de ID ${id}`;
  }

  async changeState(id: number) {
    const estado_asesoria = await this.asesoramientoRepo.findOneBy({ id });
    console.log(estado_asesoria)
    if (estado_asesoria?.estado === 'activo') {
      const desactAsesoria = await this.asesoramientoRepo.update(id, {
        estado: Estado_Asesoria.DESACTIVADO,
      });
      if (desactAsesoria.affected === 0)
        throw new BadRequestException(
          'No se desactivo ningun usuario con el ID dado',
        );
      return `Se desactivo el asesoramiento con id: ${id}`;
    }

    if (estado_asesoria?.estado === 'desactivado') {
      const desactAsesoria = await this.asesoramientoRepo.update(id, {
        estado: Estado_Asesoria.ACTIVO,
      });
      if (desactAsesoria.affected === 0)
        throw new BadRequestException(
          'No se activo ningun usuario con el ID dado',
        );
      return `Se activo el asesoramiento con id: ${id}`;
    }
    if (estado_asesoria?.estado === 'finalizado') {
      return 'Esta asesoria esta finalizada no podemos cambiarle';
    }
  }




  async listar() {
    const asesoramientos = await this.dataSource.getRepository(Contrato).createQueryBuilder('c')
      .select([
        'DISTINCT c.id AS id_contrato',
        'c.servicio AS servicio',
        'c.modalidad AS modalidad',
        'c.fecha_inicio AS fecha_inicio',
        'c.fecha_fin AS fecha_fin',
        'a.id AS id_asesoramiento',
        'a.profesion_asesoria AS profesion_asesoria',
        'aa.nombre AS area',
        "CONCAT(cli.nombre ,' ', cli.apellido) AS delegado",
      ])
      .innerJoin('c.asesoramiento', 'a')
      .innerJoin('a.procesosasesoria', 'p')
      .innerJoin('p.asesor', 'ase')
      .innerJoin('ase.areaAsesor', 'aa')
      .innerJoin('p.cliente', 'cli')
      .where('p.esDelegado = 1')
      .orderBy('id_asesoramiento', 'ASC')
      .getRawMany();
    console.log(asesoramientos);
    //Obtenemos los estudiantes por el id asesoramiento
    // const asesoramientosWithEstudiantes = await Promise.all(
    //   asesoramientos.map(async (asesoramiento) => {
    //     const estudiantes =
    //       (await this.clienteService.listAllByAsesoramiento(
    //         asesoramiento.asesoramiento.id,
    //       )) || [];
    //     return {
    //       ...asesoramiento,
    //       estudiantes,
    //     };
    //   }),
    // );
    return asesoramientos;
  }

  async listar_por_id(id: number) {
    const asesoramientos = await this.dataSource.query(`
      SELECT 
      a.id AS id_asesoramiento,
      a.fecha_inicio AS fecha_inicio,
      a.fecha_fin as fecha_fin,
      a.estado AS estado,
      a.profesion_asesoria AS profesion_asesoria,
      t.nombre AS tipo_trabajo,
      a.id_tipo_trabajo as id_tipo_trabajo,
      a.id_contrato as id_contrato,
      a.tipo_servicio as tipo_servicio,
      ase.id AS id_asesor,
      CONCAT(ase.nombre, ' ', ase.apellido) AS asesor,
      c.id AS id_delegado,
      CONCAT(c.nombre, ' ', c.apellido) AS delegado,
      ar.nombre AS area
    FROM 
      asesoramiento a
    INNER JOIN 
      tipo_trabajo t ON a.id_tipo_trabajo  = t.id
    INNER JOIN 
      procesos_asesoria p ON p.id_asesoramiento  = a.id
    INNER JOIN 
      cliente c ON p.id_cliente  = c.id
    INNER JOIN 
    asesor as ase ON ase.id = p.id_asesor
    INNER JOIN 
    area_asesor as ar ON ar.id = ase.id_area 
    WHERE p.esDelegado = 1 and a.id = ${id};
  `);

    //Obtenemos los estudiantes por el id asesoramiento
    const asesoramientosWithEstudiantes = await Promise.all(
      asesoramientos.map(async (asesoramiento) => {
        const estudiantes =
          (await this.clienteService.listAllByAsesoramiento(
            asesoramiento.id_asesoramiento,
          )) || [];
        return {
          ...asesoramiento,
          estudiantes,
        };
      }),
    );
    return asesoramientosWithEstudiantes;
  }

    async getVerInduccionCliente(id_asesoria: number){
       const datosclientes = await this.dataSource.query(`
          SELECT 
              a.id as id_asesoramiento,
              a.profesion_asesoria as referencia,
              concat(c.nombre,'',c.apellido) as delegado,
              ar.nombre as area
          FROM  asesoramiento  a
              INNER JOIN procesos_asesoria pr ON a.id = pr.id_asesoramiento
              INNER JOIN cliente c ON pr.id_cliente = c.id
              INNER JOIN asesor ase ON pr.id_asesor = ase.id
              INNER JOIN area ar ON ase.id_area = ar.id
          WHERE pr.esDelegado = true and a.id = ${id_asesoria} ;
        `);
        //Estudiantes y asesores de asesoramiento
        const induccion = await Promise.all(
          datosclientes.map(async(asesoria) =>{
            const estudiantes = 
              (await this.clienteService.listAllByAsesoramiento(
                asesoria.id_asesoramiento,
              )) || [];
              return {
                ...asesoria,
                estudiantes
              };
          }),
        )
  
  
      return induccion;
    }

    async listarAsignados() {
      const listar = await this.dataSource.query(`
        SELECT 
          a.id as id_asesoramiento,
          concat(c.nombre,'',c.apellido) as delegado,
          con.fecha_inicio as fechaAsignacion,
          t.nombre as tipotrabajo,
          ar.nombre as area,
          ase.nombre as asesor,
          a.estado as estado
        FROM  asesoramiento  a
          INNER JOIN procesos_asesoria pr ON a.id = pr.id_asesoramiento
          INNER JOIN cliente c ON pr.id_cliente = c.id
          INNER JOIN asesor ase ON pr.id_asesor = ase.id
          INNER JOIN area ar ON ase.id_area = ar.id
          INNER JOIN contrato con ON a.id = con.id_asesoramiento
          INNER JOIN tipo_trabajo t ON con.id_tipoTrabajo = t.id
        WHERE pr.esDelegado = true  ;
        
        `)
        const listclientes = await Promise.all(
          listar.map(async( asesoria)=>{
            const cliente = await (this.clienteService.listAllByAsesoramiento(
              asesoria.id_asesoramiento,
            ))||([]);
            return {
              ...asesoria,
              cliente
            }
          })
        )
      return listclientes;
    }

  async listarContratosSinAsignar() {
    const listar = await this.dataSource.query(``)

  }

  async listarContratosAsignados() {
    const listar = await this.dataSource.query(`
      SELECT 
        a.id as id_asesoramiento,
        t.nombre as trabajo_investigacion,
        concat(c.nombre ,'',c.apellido) as delegado,
        con.fecha_inicio as fecha_registro,
        con.modalidad as modalidad,
        tp.nombre as tipo_pago
      FROM asesoramiento a
        INNER JOIN contrato con ON  a.id = con.id_asesoramiento
        INNER JOIN tipo_trabajo t ON con.id_tipoTrabajo = t.id
        INNER JOIN procesos_asesoria p ON a.id = p.id_asesoramiento
        INNER JOIN cliente c ON p.id_cliente = c.id 
        INNER JOIN tipo_pago tp ON con.id_tipoPago = tp.id
      WHERE p.esDelegado = true 
      `)
      return listar;
  }

  async listar_segun_fecha(fecha_limite: Date) {
    console.log(fecha_limite);
    const listAsesoria = await this.asesoramientoRepo
      .createQueryBuilder('a')
      .innerJoin('a.tipoTrabajo', 't')
      .innerJoin('a.procesosasesoria', 'p')
      .innerJoin('p.cliente', 'c')
      .innerJoin('p.asesor', 'ase')
      .select([
        'a.id',
        'a.estado AS estado',
        'a.fecha_inicio',
        'c.id AS id_cliente',
        'c.nombre AS cliente_nombre',
        'c.apellido AS cliente_apellido',
        'c.id AS id_asesor',
        'ase.nombre AS asesor_nombre',
        'ase.apellido AS asesor_apellido',
        't.nombre AS tipo_trabajo',
      ])
      .where('a.fecha_inicio>= :desde', {
        desde: fecha_limite,
      })
      .orderBy('p.id', 'ASC')
      .getRawMany();

    if (!listAsesoria || listAsesoria.length === 0) {
      throw new NotFoundException('No hay asesorías disponibles');
    }
    let idUsados: number[] = [];
    let arregloAsesorias: object[] = [];
    let contador_alumnos = 0;
    let contador_columnas = -1;

    for (let i = 0; i < listAsesoria.length; i++) {
      const asesoría = listAsesoria[i];

      if (
        !asesoría.a_id ||
        !asesoría.cliente_nombre ||
        !asesoría.cliente_apellido
      ) {
        throw new BadRequestException('Datos incompletos para la asesoría');
      }

      contador_alumnos += 1;
      if (idUsados.includes(asesoría.a_id)) {
        arregloAsesorias[contador_columnas] = {
          ...arregloAsesorias[contador_columnas],
          [`id_estudiante${contador_alumnos}`]: asesoría.id_cliente,
          [`estudiante${contador_alumnos}`]: `${asesoría.cliente_nombre} ${asesoría.cliente_apellido}`,
        };
      } else {
        contador_columnas += 1;
        contador_alumnos = 1;
        arregloAsesorias[contador_columnas] = {
          id_asesoramiento: asesoría.a_id,
          fecha_inicio: asesoría.a_fecha_inicio,
          id_asesor: asesoría.id_asesor,
          asesor: asesoría.asesor_nombre + ' ' + asesoría.asesor_apellido,
          tipo_trabajo: asesoría.tipo_trabajo,
          estado: asesoría.estado,
          id_delegado: asesoría.id_cliente,
          delegado: asesoría.cliente_nombre + ' ' + asesoría.cliente_apellido,
        };
        idUsados.push(asesoría.a_id);
      }
    }
    //console.log(arregloAsesorias)
    return arregloAsesorias;
  }

  async update(
    id: number,
    updateAsesoramientoDto: UpdateAsesoramientoDto,
    clientes: clientesExtraDTO,
  ) {
    // console.log("ID",id)
    // console.log("Update asesoramientoDto",updateAsesoramientoDto)
    // console.log("Clientes",clientes)
    // let id_asesor;
    // console.log(clientes)
    // if (updateAsesoramientoDto.id_asesor !== undefined) {
    //   id_asesor = updateAsesoramientoDto.id_asesor;
    //   delete updateAsesoramientoDto.id_asesor;
    // }

    // const queryRunner = this.dataSource.createQueryRunner();
    // await queryRunner.connect();
    // await queryRunner.startTransaction();

    // try {
    //   if (
    //     updateAsesoramientoDto.fecha_inicio &&
    //     updateAsesoramientoDto.fecha_fin
    //   ) {
    //     if (
    //       updateAsesoramientoDto.fecha_fin < updateAsesoramientoDto.fecha_inicio
    //     ) {
    //       throw new BadRequestException(
    //         'La fecha de fin no puede ser anterior a la fecha de inicio',
    //       );
    //     }
    //   }
    //   const updated = { ...updateAsesoramientoDto };
    //   if (updateAsesoramientoDto.id_contrato) {
    //     delete updated.id_contrato;
    //     updated['tipoContrato'] = { id: updateAsesoramientoDto.id_contrato };
    //   }

    //   if (updateAsesoramientoDto.id_tipo_trabajo) {
    //     delete updated.id_tipo_trabajo;
    //     updated['tipoTrabajo'] = { id: updateAsesoramientoDto.id_tipo_trabajo };
    //   }

    //   await queryRunner.manager.update(Asesoramiento, { id }, { ...updated });

    //   const clienteIds: number[] = Object.values(clientes).filter(
    //     (id) => typeof id === 'number' && id > 0,
    //   );

    //   // console.log("ClientesId ",clienteIds)

    //   if (clienteIds.length === 0) {
    //     throw new BadRequestException(
    //       'Debe proporcionar al menos un cliente válido',
    //     );
    //   }

    //   const procesosActuales = await queryRunner.manager.find(
    //     ProcesosAsesoria,
    //     {
    //       where: { asesoramiento: { id } },
    //       order: { id: 'ASC' }, // Importante para que se mantenga el orden y se puedan comparar
    //     },
    //   );

    //   // console.log("Proceso actuales: ",procesosActuales)

    //   const cantidadActual = procesosActuales.length;
    //   const cantidadNueva = clienteIds.length;

    //   const cantidadActualizar = Math.min(cantidadActual, cantidadNueva);

    //   let esDelegado = false;
    //   for (let i = 0; i < cantidadActualizar; i++) {
    //     esDelegado = i == 0 ? true : false;
    //     console.log("clientes: ",clientes)
    //     await this.procesosAsesoriaService.actualizar_registros_por_Asesoramiento(
    //       id,
    //       clienteIds[i],
    //       id_asesor,
    //       esDelegado,
    //       queryRunner.manager,
    //       procesosActuales[i].id,
    //     );
    //   }

    //   // 5. Agregar nuevos si hay más clientes
    //   if (cantidadNueva > cantidadActualizar) {
    //     for (let i = cantidadActualizar; i < cantidadNueva; i++) {
    //       esDelegado = i == 0 ? true : false;
    //       await this.procesosAsesoriaService.crear_registro_por_Asesoramiento(
    //         id,
    //         clienteIds[i],
    //         id_asesor,
    //         esDelegado,
    //         queryRunner.manager,
    //       );
    //     }
    //   }
    //   // 6. Eliminar registros sobrantes si hay menos clientes
    //   if (cantidadNueva < cantidadActual) {
    //     for (let i = cantidadNueva; i < cantidadActual; i++) {
    //       await queryRunner.manager.delete(
    //         ProcesosAsesoria,
    //         procesosActuales[i].id,
    //       );
    //     }
    //   }

    //   await queryRunner.commitTransaction();
    //   return 'Actualizado satisfactoriamente';
    // } catch (err) {
    //   queryRunner.rollbackTransaction();
    //   throw new InternalServerErrorException(
    //     `No se puede actualizar completemente,cancelando cambios se presta este error ${err}`,
    //   );
    // } finally {
    //   await queryRunner.release();
    // }
  }

  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.procesosAsesoriaService.remove_by_asesoramiento(
        id,
        queryRunner.manager,
      );
      const deletedAsesoramiento = await queryRunner.manager.delete(
        Asesoramiento,
        { id },
      );
      if (deletedAsesoramiento.affected === 0)
        throw new NotFoundException(
          `No se encontro para eliminar con ese id:${id}`,
        );
      await queryRunner.commitTransaction();
      return deletedAsesoramiento;
    } catch (err) {
      queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `No se puede actualizar completemente,cancelando cambios se presta este error ${err}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async asesoramientosByClient(id: number) {
    try {
      const RawAsesoramiento = await this.asesoramientoRepo
        .createQueryBuilder('a')
        .innerJoinAndSelect('a.procesosasesoria', 'p')
        .innerJoinAndSelect('p.cliente', 'cli')
        .select(['a.id AS id,a.profesion_asesoria AS profesion_asesoria'])
        .where('cli.id = :id', { id })
        .andWhere('a.estado = :estado', { estado: Estado_Asesoria.ACTIVO })
        .getRawMany();

      console.log('RawAsesoramiento', RawAsesoramiento);
      if (!RawAsesoramiento || RawAsesoramiento.length === 0) {
        return {
          // data: [],
          isEmpty: true,
          message: 'No se encontraron asesoramientos para este cliente',
        };
      }
      // throw new Error('No se encontraron asesoramientos para este cliente');

      let response = {};
      RawAsesoramiento.forEach((item, index) => {
        response[`asesoria${index + 1}`] = item;
      });

      return response;
    } catch (err) {
      console.error(
        'Error al obtener los asesoramientos del cliente:',
        err.message,
      );
      throw new InternalServerErrorException(
        'Error al obtener los asesoramientos del cliente',
      );
    }
  }

  async getInfoAsesorbyAsesoramiento(id: number) {
    try {
      const datosAsesor = await this.asesoramientoRepo
        .createQueryBuilder('a')
        .innerJoin('a.procesosasesoria', 'p')
        .innerJoinAndSelect('p.asesor', 'ase')
        .innerJoinAndSelect('ase.gradoAcademico', 'grad')
        .innerJoinAndSelect('ase.areaAsesor', 'area')
        .select([
          'ase.id AS id',
          'ase.nombre AS nombre',
          'ase.apellido AS apellido',
          'ase.universidad AS universidad',
          'ase.url_imagen AS url_imagen',
          'grad.nombre AS gradoAcademico',
          'area.nombre AS areaNombre',
        ])
        .where('a.id= :id', { id })
        .getRawOne();

      if (!datosAsesor)
        throw new NotFoundException('No se encontraron asesores');
      if (!datosAsesor.nombre || !datosAsesor.apellido)
        throw new Error('Los datos del asesor están incompletos');

      return datosAsesor;
    } catch (err) {
      throw new InternalServerErrorException('Error al obtener el asesor');
    }
  }

  async contratoDelAsesoramiento(id: number) {
    const datosContrato = await this.asesoramientoRepo.findOne({
      where: { id },
    });
    // const datosContrato = await this.asesoramientoRepo.findOne({
    //   where: { id },
    //   relations: ['tipoContrato'],
    //   select: ['id', 'fecha_inicio', 'fecha_fin'],
    // });
    // if (!datosContrato)
    //   throw new NotFoundException(
    //     'No hay un contrato con ese id de asesoramiento',
    //   );
    // if (!datosContrato.tipoContrato)
    //   throw new NotFoundException(
    //     'No se encontró un tipo de contrato asociado al asesoramiento',
    //   );

    return datosContrato;
  }

  async listAsesoriasSinpagos(tipoContrato: string,): Promise<listAsesoramientoYDelegadoDto[]> {
    const datosAsesoramiento = await this.asesoramientoRepo
      .createQueryBuilder('ase')
      .leftJoin('ase.informacion_pago', 'infoPago')
      .innerJoinAndSelect('ase.tipoContrato', 'con')
      .innerJoinAndSelect('ase.tipoTrabajo', 'tra')
      .select([
        'ase.id AS id',
        'con.tipo_contrato AS tipo_contrato',
        'tra.nombre AS tipo_trabajo',
        'ase.fecha_inicio',
        'ase.profesion_asesoria AS profesion_asesoria',
      ])
      .where('infoPago.id IS NULL')
      .andWhere('con.tipo_contrato= :tipoContrato', { tipoContrato })
      .getRawMany();

    const listAsesoramientoAndDelegado = await Promise.all(
      datosAsesoramiento.map(async (asesoramiento) => {
        let delegado = await this.clienteService.getDelegado(asesoramiento.id);
        return {
          id_asesoramiento: asesoramiento.id,
          delegado: delegado.nombre_delegado,
          tipo_contrato: asesoramiento.tipo_contrato,
          tipo_trabajo: asesoramiento.tipo_trabajo,
          profesion_asesoria: asesoramiento.profesion_asesoria,
        };
      }),
    );
    return listAsesoramientoAndDelegado;
  }

  async listDelegadoToServicios() {
    const datosAsesoramiento = await this.asesoramientoRepo
      .createQueryBuilder('ase')
      .leftJoin('ase.informacion_pago', 'infoPago')
      .innerJoinAndSelect('ase.tipoTrabajo', 'tra')
      .select(['DISTINCT ase.id AS id', 'tra.nombre AS tipo_trabajo'])
      .where('infoPago.id IS NOT NULL')
      .getRawMany();

    const listAsesoramientoAndDelegado = await Promise.all(
      datosAsesoramiento.map(async (asesoramiento) => {
        let delegado = await this.clienteService.getDelegado(asesoramiento.id);
        return {
          id_asesoramiento: asesoramiento.id,
          delegado: delegado.nombre_delegado,
          tipo_trabajo: asesoramiento.tipo_trabajo,
        };
      }),
    );

    return listAsesoramientoAndDelegado;
  }

  async getAsesoramientoByAsesor(id_asesor: number) {
    const idAsesores = await this.asesoramientoRepo
      .createQueryBuilder('ases')
      .innerJoin('ases.procesosasesoria', 'pro')
      .innerJoinAndSelect('pro.asesor', 'asesor')
      .select('DISTINCT ases.id', 'id')
      .where('asesor.id = :id', { id: id_asesor })
      .getRawMany();

    const ids = idAsesores.map((r) => r.id);

    return ids;
  }

  async gestionAsesorias(id: number, estado: Estado_Asesoria) {
    const listAsesorias = await this.asesoramientoRepo
      .createQueryBuilder('asesoramiento')
      .innerJoin('asesoramiento.procesosasesoria', 'pro')
      .innerJoinAndSelect('asesoramiento.tipoTrabajo', 'tipoTrabajo')
      .innerJoinAndSelect('pro.asesor', 'asesor')
      .select([
        'DISTINCT asesoramiento.id AS id',
        'asesoramiento.profesion_asesoria AS profesion_asesoria',
        'tipoTrabajo.nombre AS tipotrabajo',
        'asesoramiento.fecha_inicio AS fecha_inicio',
        'asesoramiento.fecha_fin AS fecha_fin',
      ])
      .where('asesor.id= :id', { id })
      .andWhere('asesoramiento.estado= :estado', { estado })
      .getRawMany();

    if (listAsesorias.length === 0)
      throw new NotFoundException('No presenta asesorias');

    const responseAsesorias = await Promise.all(
      listAsesorias.map(async (asesoria) => {
        const delegado = await this.clienteService.getDelegado(asesoria.id);
        return {
          id: asesoria.id,
          delegado: delegado.nombre_delegado,
          profesion_asesoria: asesoria.profesion_asesoria,
          tipo_trabajo: asesoria.tipotrabajo,
          fecha_inicio: asesoria.fecha_inicio,
          fecha_fin: asesoria.fecha_fin,
          especialidad: asesoria.especialidad,
        };
      }),
    );

    return responseAsesorias;
  }

  async fecha_vencimiento_contrato(id) {
    const fechaVencimiento = await this.asesoramientoRepo.findOne({
      where: { id },
      // select: ['fecha_fin']
    });
    if (!fechaVencimiento)
      throw new NotFoundException('No se encontro un asesoramiento con ese id');
    return fechaVencimiento;
  }
}
