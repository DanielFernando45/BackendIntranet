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
  ) {}

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
    console.log(estado_asesoria);
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
    const asesoramientos = await this.dataSource
      .getRepository(Contrato)
      .createQueryBuilder('c')
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

  async getVerInduccionCliente(id_asesoria: number) {
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
      datosclientes.map(async (asesoria) => {
        const estudiantes =
          (await this.clienteService.listAllByAsesoramiento(
            asesoria.id_asesoramiento,
          )) || [];
        return {
          ...asesoria,
          estudiantes,
        };
      }),
    );

    return induccion;
  }
  async listarAsignados() {
    const listar = await this.dataSource.query(`
    SELECT 
      a.id as id_asesoramiento,
      CONCAT(c.nombre, ' ', c.apellido) as delegado,
      c.id as id_delegado,  -- ID del delegado
      con.fecha_inicio as inicioContrato, -- Agregado
      con.fecha_fin as finContrato,       -- Ya estaba
      t.nombre as tipotrabajo,
      ar.nombre as area,
      ase.nombre as asesor,
      a.estado as estado
    FROM asesoramiento a
      LEFT JOIN procesos_asesoria pr 
        ON a.id = pr.id_asesoramiento AND pr.esDelegado = 1
      LEFT JOIN cliente c 
        ON pr.id_cliente = c.id
      LEFT JOIN asesor ase 
        ON pr.id_asesor = ase.id
      LEFT JOIN area ar 
        ON ase.id_area = ar.id
      LEFT JOIN contrato con 
        ON a.id = con.id_asesoramiento
      LEFT JOIN tipo_trabajo t 
        ON con.id_tipoTrabajo = t.id
    WHERE a.estado = 'activo';
  `);

    // Agregar los clientes asignados a cada asesoramiento
    const listclientes = await Promise.all(
      listar.map(async (asesoria) => {
        const cliente = await this.clienteService.listAllByAsesoramiento(
          asesoria.id_asesoramiento,
        );
        return {
          ...asesoria,
          cliente: cliente || [],
        };
      }),
    );

    return listclientes;
  }

  async listarAsignadosJefeOpe() {
    const listar = await this.dataSource.query(`
    SELECT 
      a.id as id_asesoramiento,
      CONCAT(c.nombre, ' ', c.apellido) as delegado,
      c.id as id_delegado,  -- Agregar el ID del delegado
      con.fecha_fin as finContrato,
      t.nombre as tipotrabajo,
      ar.nombre as area,
      ase.nombre as asesor,
      a.estado as estado
    FROM asesoramiento a
      LEFT JOIN procesos_asesoria pr 
        ON a.id = pr.id_asesoramiento AND pr.esDelegado = 1
      LEFT JOIN cliente c 
        ON pr.id_cliente = c.id
      LEFT JOIN asesor ase 
        ON pr.id_asesor = ase.id
      LEFT JOIN area ar 
        ON ase.id_area = ar.id
      LEFT JOIN contrato con 
        ON a.id = con.id_asesoramiento
      LEFT JOIN tipo_trabajo t 
        ON con.id_tipoTrabajo = t.id
  `);

    // Agregamos los clientes asignados a cada asesoramiento
    const listclientes = await Promise.all(
      listar.map(async (asesoria) => {
        const cliente = await this.clienteService.listAllByAsesoramiento(
          asesoria.id_asesoramiento,
        );
        return {
          ...asesoria,
          cliente: cliente || [],
        };
      }),
    );

    return listclientes;
  }

  async crearYAsignarAsesoramiento(
    asesorId: number,
    clientesIds: number[],
    profesionAsesoria: string,
    area: string, // solo para la respuesta
  ) {
    try {
      if (!clientesIds || clientesIds.length === 0) {
        return {
          success: false,
          mensaje: 'Debe seleccionar al menos un cliente.',
        };
      }

      // Validar máximo 5 clientes
      if (clientesIds.length > 5) {
        return {
          success: false,
          mensaje: 'No se puede asignar más de 5 clientes a un asesoramiento.',
        };
      }

      // Crear un nuevo asesoramiento
      const resultado = await this.dataSource.query(
        `INSERT INTO asesoramiento (profesion_asesoria, estado)
       VALUES (?, 'activo')`,
        [profesionAsesoria],
      );

      const asesoramientoId = resultado.insertId;

      // Insertar los clientes en procesos_asesoria
      for (let i = 0; i < clientesIds.length; i++) {
        await this.dataSource.query(
          `INSERT INTO procesos_asesoria (id_asesoramiento, id_cliente, id_asesor, esDelegado)
         VALUES (?, ?, ?, ?)`,
          [asesoramientoId, clientesIds[i], asesorId, i === 0 ? 1 : 0],
        );
      }

      // Obtener nombres del asesor y clientes
      const [asesor] = await this.dataSource.query(
        `SELECT nombre FROM asesor WHERE id = ?`,
        [asesorId],
      );

      const clientes = await this.dataSource.query(
        `SELECT id, nombre FROM cliente WHERE id IN (?)`,
        [clientesIds],
      );

      const clientesAsignados = clientes.map((c, index) => ({
        nombre: c.nombre,
        esDelegado: index === 0,
      }));

      return {
        success: true,
        mensaje: 'Asesoramiento creado y clientes asignados correctamente',
        asesoramientoId,
        asesor: asesor?.nombre || null,
        profesionAsesoria,
        area, // solo para la respuesta
        clientesAsignados,
      };
    } catch (error) {
      return {
        success: false,
        mensaje: 'Ocurrió un error al crear el asesoramiento.',
        error: error.message,
      };
    }
  }

  async actualizarAsesoramiento(
    asesoramientoId: number,
    asesorId: number,
    clientesIds: number[],
    profesionAsesoria: string,
    area: string, // solo para la respuesta
  ) {
    if (!clientesIds || clientesIds.length === 0) {
      throw new Error('Debe seleccionar al menos un cliente.');
    }

    if (clientesIds.length > 5) {
      throw new Error(
        'No se puede asignar más de 5 clientes a un asesoramiento.',
      );
    }

    // Verificar que el asesor exista
    const [asesor] = await this.dataSource.query(
      `SELECT nombre FROM asesor WHERE id = ?`,
      [asesorId],
    );
    if (!asesor) throw new Error('Asesor no encontrado.');

    // Verificar que los clientes existan
    const clientes = await this.dataSource.query(
      `SELECT id, nombre FROM cliente WHERE id IN (?)`,
      [clientesIds],
    );
    if (clientes.length !== clientesIds.length) {
      throw new Error('Uno o más clientes no existen.');
    }

    // Iniciar transacción
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Actualizar la información del asesoramiento
      await queryRunner.query(
        `UPDATE asesoramiento SET profesion_asesoria = ? WHERE id = ?`,
        [profesionAsesoria, asesoramientoId],
      );

      // Eliminar asignaciones anteriores de clientes
      await queryRunner.query(
        `DELETE FROM procesos_asesoria WHERE id_asesoramiento = ?`,
        [asesoramientoId],
      );

      // Insertar nuevas asignaciones de clientes
      const procesosValues = clientesIds.map((id, index) => [
        asesoramientoId,
        id,
        asesorId,
        index === 0 ? 1 : 0, // delegado
      ]);

      await queryRunner.query(
        `INSERT INTO procesos_asesoria (id_asesoramiento, id_cliente, id_asesor, esDelegado) VALUES ?`,
        [procesosValues],
      );

      await queryRunner.commitTransaction();

      // Preparar respuesta
      const clientesAsignados = clientes.map((c, index) => ({
        nombre: c.nombre,
        esDelegado: index === 0,
      }));

      return {
        mensaje:
          'Asesoramiento actualizado y clientes reasignados correctamente',
        asesoramientoId,
        asesor: asesor.nombre,
        profesionAsesoria,
        area,
        clientesAsignados,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async listarAsignadosPorSupervisor(idSupervisor: string) {
    // 1) Traer asesoramientos activos ligados a las áreas del supervisor
    const filas = await this.dataSource.query(
      `
      SELECT 
        a.id AS id_asesoramiento,
        CONCAT(c.nombre, ' ', c.apellido) AS delegado,
        COALESCE(GROUP_CONCAT(DISTINCT t.nombre SEPARATOR ', '), '—') AS tipotrabajo,
        ar.nombre AS area,
        ase.nombre AS asesor,
        a.estado AS estado
      FROM asesoramiento a
        LEFT JOIN procesos_asesoria pr 
          ON a.id = pr.id_asesoramiento AND pr.esDelegado = 1
        LEFT JOIN cliente c 
          ON pr.id_cliente = c.id
        LEFT JOIN asesor ase 
          ON pr.id_asesor = ase.id
        LEFT JOIN area ar 
          ON ase.id_area = ar.id
        LEFT JOIN contrato con 
          ON a.id = con.id_asesoramiento
        LEFT JOIN tipo_trabajo t 
          ON con.id_tipoTrabajo = t.id
      WHERE 
        a.estado = 'activo'
        AND ar.id_supervisor = ?   -- filtra por supervisor
      GROUP BY 
        a.id, c.nombre, c.apellido, ar.nombre, ase.nombre, a.estado
      ORDER BY a.id DESC
      `,
      [idSupervisor],
    );

    // 2) Adjuntar clientes por asesoramiento
    const conClientes = await Promise.all(
      (filas as any[]).map(async (asesoria) => {
        const cliente = await this.clienteService.listAllByAsesoramiento(
          asesoria.id_asesoramiento,
        );
        return {
          ...asesoria,
          cliente: cliente || [],
        };
      }),
    );

    return conClientes;
  }

  async obtenerAsesoramientoPorId(asesoramientoId: number) {
    const [asesoramiento] = await this.dataSource.query(
      `
    SELECT 
      a.id AS asesoramientoId,
      a.profesion_asesoria AS profesionAsesoria,
      s.nombre AS asesor,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', c.id,
          'nombre', c.nombre,
          'esDelegado', p.esDelegado,
          'fecha_creacion', c.fecha_creacion,
          'carrera', c.carrera,
          'gradoAcademico', ga.nombre  -- <-- del catálogo grado_academico
        )
      ) AS clientesAsignados
    FROM asesoramiento a
    INNER JOIN procesos_asesoria p ON p.id_asesoramiento = a.id
    INNER JOIN asesor s ON s.id = p.id_asesor
    INNER JOIN cliente c ON c.id = p.id_cliente
    LEFT JOIN grado_academico ga ON ga.id = c.id_grado_academico
    WHERE a.id = ?
    GROUP BY a.id, a.profesion_asesoria, s.nombre
    `,
      [asesoramientoId],
    );

    if (!asesoramiento) {
      throw new Error('Asesoramiento no encontrado.');
    }

    // Si MySQL devuelve string, parsea; si ya es objeto, úsalo directo
    let clientes = asesoramiento.clientesAsignados;
    if (typeof clientes === 'string') {
      clientes = JSON.parse(clientes);
    }

    const clientesNormalizados = (clientes ?? []).map((c: any) => {
      // Normaliza boolean
      const esDelegado =
        c.esDelegado === true || c.esDelegado === 1 || c.esDelegado === '1';

      // Normaliza fecha a ISO si es parseable
      let fechaISO: string | null = null;
      if (c.fecha_creacion != null) {
        const d = new Date(c.fecha_creacion);
        fechaISO = isNaN(d.getTime())
          ? String(c.fecha_creacion)
          : d.toISOString();
      }

      return {
        id: c.id,
        nombre: c.nombre,
        esDelegado,
        fecha_creacion: fechaISO, // ej. "2025-09-17T21:48:52.279Z"
        carrera: c.carrera,
        gradoAcademico: c.gradoAcademico ?? null, // ej. "Estudiante Pregrado"
      };
    });

    return {
      asesoramientoId: asesoramiento.asesoramientoId,
      asesor: asesoramiento.asesor,
      profesionAsesoria: asesoramiento.profesionAsesoria,
      clientesAsignados: clientesNormalizados,
    };
  }

  async listarContratosSinAsignar() {
    const listar = await this.dataSource.query(`
      SELECT 
        a.id as id_asesoramiento,
        concat(c.nombre ,'',c.apellido) as delegado,
        ase.nombre as asesor
      FROM asesoramiento a
        INNER JOIN procesos_asesoria p ON a.id = p.id_asesoramiento
        INNER JOIN asesor ase ON p.id_asesor = ase.id
        INNER JOIN cliente c ON p.id_cliente = c.id 
      WHERE p.esDelegado = true 
      `);

    const listContratosSinAsignar = await Promise.all(
      listar.map(async (asesoria) => {
        const cliente =
          (await this.clienteService.listAllByAsesoramiento(
            asesoria.id_asesoramiento,
          )) || [];
        return {
          ...asesoria,
          cliente,
        };
      }),
    );

    return listContratosSinAsignar;
  }
  async listarContratosAsignados() {
    const listar = await this.dataSource.query(`
    SELECT 
      a.id AS id_asesoramiento,              -- ✅ ID del asesoramiento
      con.id AS id_contrato,                 -- Contrato
      t.nombre AS trabajo_investigacion,     -- Tipo de trabajo
      CONCAT(c.nombre, ' ', c.apellido) AS delegado,
      con.fecha_inicio AS fecha_inicio,      -- Fecha de inicio del contrato
      con.fecha_fin AS fecha_fin,            -- Fecha de fin del contrato
      con.modalidad AS modalidad,
      tp.nombre AS tipo_pago
    FROM asesoramiento a
      INNER JOIN contrato con ON a.id = con.id_asesoramiento
      INNER JOIN tipo_trabajo t ON con.id_tipoTrabajo = t.id
      INNER JOIN procesos_asesoria p ON a.id = p.id_asesoramiento
      INNER JOIN cliente c ON p.id_cliente = c.id 
      INNER JOIN tipo_pago tp ON con.id_tipoPago = tp.id
    WHERE p.esDelegado = true
  `);
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

  async listAsesoriasSinpagos(
    tipoContrato: string,
  ): Promise<listAsesoramientoYDelegadoDto[]> {
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
    try {
      // Consulta para obtener los asesoramientos con información de pago
      const datosAsesoramiento = await this.asesoramientoRepo
        .createQueryBuilder('ase')
        .leftJoin('ase.informacion_pago', 'infoPago') // LEFT JOIN para obtener los asesoramientos con pagos
        .where('infoPago.id IS NOT NULL') // Filtramos por aquellos con pago
        .select(['ase.id']) // Seleccionamos solo el ID de asesoramiento
        .getRawMany(); // Obtenemos el resultado crudo de la consulta

      // Obtenemos el delegado asociado a cada asesoramiento
      const listAsesoramientoAndDelegado = await Promise.all(
        datosAsesoramiento.map(async (asesoramiento) => {
          let delegado;
          try {
            // Intentamos obtener el delegado asociado a este asesoramiento
            delegado = await this.clienteService.getDelegado(asesoramiento.id);
          } catch (err) {
            // En caso de error al obtener el delegado, asignamos un valor por defecto
            console.error('Error al obtener delegado:', err);
            delegado = { nombre_delegado: 'Desconocido' }; // Valor por defecto si no se puede obtener el delegado
          }

          // Devolvemos el objeto con la información relevante
          return {
            id_asesoramiento: asesoramiento.id,
            delegado: delegado.nombre_delegado,
          };
        }),
      );

      // Devolvemos la lista de asesoramientos con sus respectivos delegados
      return listAsesoramientoAndDelegado;
    } catch (err) {
      // En caso de error general, lo logueamos y lanzamos un error del servidor
      console.error('Error en la función listDelegadoToServicios:', err);
      throw new InternalServerErrorException(
        'Hubo un error al obtener los servicios',
      );
    }
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
