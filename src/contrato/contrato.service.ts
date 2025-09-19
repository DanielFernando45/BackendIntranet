import { Injectable } from '@nestjs/common';
import { Asesoramiento } from 'src/asesoramiento/entities/asesoramiento.entity';
import { Repository } from 'typeorm';
import { Contrato } from './entities/contrato.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { NotFoundException } from '@nestjs/common';
import { TipoTrabajo } from 'src/common/entidades/tipoTrabajo.entity';
import { TipoPago } from 'src/common/entidades/tipoPago.entity';
import { Categoria } from 'src/categoria/entities/categoria.entity';
import { BadRequestException } from '@nestjs/common';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { ClienteService } from 'src/cliente/cliente.service';

@Injectable()
export class ContratoService {
  constructor(
    private readonly clienteService: ClienteService,
    private readonly dataSource: DataSource,
    @InjectRepository(Contrato)
    private readonly contratoRepo: Repository<Contrato>,

    @InjectRepository(Asesoramiento)
    private readonly asesoramientoRepo: Repository<Asesoramiento>,

    @InjectRepository(TipoTrabajo)
    private readonly tipoTrabajoRepo: Repository<TipoTrabajo>,

    @InjectRepository(TipoPago)
    private readonly tipoPagoRepo: Repository<TipoPago>,

    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
  ) {}

  async listarContratosAsignados() {
    const contratosAsignados = await this.dataSource.query(`
    SELECT 
      a.id as id_asesoramiento,
      CONCAT(c.nombre, ' ', c.apellido) as delegado,
      con.fecha_fin as finContrato,
      t.nombre as tipotrabajo,
      ar.nombre as area,
      ase.nombre as asesor,
      a.estado as estado
    FROM asesoramiento a
      LEFT JOIN procesos_asesoria pr ON a.id = pr.id_asesoramiento AND pr.esDelegado = 1
      LEFT JOIN cliente c ON pr.id_cliente = c.id
      LEFT JOIN asesor ase ON pr.id_asesor = ase.id
      LEFT JOIN area ar ON ase.id_area = ar.id
      LEFT JOIN contrato con ON a.id = con.id_asesoramiento
      LEFT JOIN tipo_trabajo t ON con.id_tipoTrabajo = t.id
    WHERE a.estado = 'activo' AND con.id_asesoramiento IS NOT NULL;
  `);

    // Agregar los clientes asignados a cada contrato
    const listclientes = await Promise.all(
      contratosAsignados.map(async (contrato) => {
        const clientes = await this.clienteService.listAllByAsesoramiento(
          contrato.id_asesoramiento,
        );
        return {
          ...contrato,
          clientes: clientes || [], // Añadir los clientes relacionados al contrato
        };
      }),
    );

    return listclientes;
  }
  async listarContratosNoAsignados() {
    const contratosNoAsignados = await this.dataSource.query(`
    SELECT 
      a.id as id_asesoramiento,
      CONCAT(c.nombre, ' ', c.apellido) as delegado,
      con.fecha_fin as finContrato,
      t.nombre as tipotrabajo,
      ar.nombre as area,
      ase.nombre as asesor,
      a.estado as estado,
      cli.id as id_estudiante,
      CONCAT(cli.nombre, ' ', cli.apellido) as estudiante
    FROM asesoramiento a
    LEFT JOIN procesos_asesoria pr ON a.id = pr.id_asesoramiento AND pr.esDelegado = 1
    LEFT JOIN cliente c ON pr.id_cliente = c.id
    LEFT JOIN asesor ase ON pr.id_asesor = ase.id
    LEFT JOIN area ar ON ase.id_area = ar.id
    LEFT JOIN contrato con ON a.id = con.id_asesoramiento
    LEFT JOIN tipo_trabajo t ON con.id_tipoTrabajo = t.id
    LEFT JOIN cliente cli ON pr.id_cliente = cli.id
    WHERE a.estado = 'activo' AND con.id_asesoramiento IS NULL
  `);

    // Crear la lista final con la estructura correcta
    const contratos = contratosNoAsignados.reduce((result, contrato) => {
      // Verificamos si ya existe un objeto para el asesoramiento
      let asesoramiento = result.find(
        (item) => item.id_asesoramiento === contrato.id_asesoramiento,
      );

      // Si no existe, inicializamos un objeto nuevo para ese asesoramiento
      if (!asesoramiento) {
        asesoramiento = {
          id_asesoramiento: contrato.id_asesoramiento,
          delegado: contrato.delegado,
          finContrato: contrato.finContrato,
          tipotrabajo: contrato.tipotrabajo,
          area: contrato.area,
          asesor: contrato.asesor,
          estado: contrato.estado,
          cliente: [], // Inicializamos un array vacío de clientes
        };
        result.push(asesoramiento); // Agregamos el nuevo objeto de asesoramiento al resultado
      }

      // Si el cliente tiene información, lo agregamos a la lista de clientes de ese asesoramiento
      if (contrato.estudiante) {
        asesoramiento.cliente.push({
          id_estudiante: contrato.id_estudiante,
          estudiante: contrato.estudiante,
        });
      }

      return result; // Devolvemos el array de contratos agrupados
    }, []); // Usamos un array vacío como acumulador

    return contratos; // Retornamos la lista de contratos con todos los clientes agrupados
  }

  // contratoDelAsesoramiento
  async contratoByAsesoramiento(id: string) {
    const findFechasContrato = await this.contratoRepo
      .createQueryBuilder('contrato')
      .select('contrato.fecha_inicio')
      .innerJoinAndSelect('contrato.tipoPago', 'tip')
      .where('contrato.id = :idContrato', { idContrato: id })
      .getRawOne();

    return findFechasContrato;
  }

  async createContrato(idAsesoramiento: number, dto: CreateContratoDto) {
    const asesoramiento = await this.asesoramientoRepo.findOneBy({
      id: idAsesoramiento,
    });
    if (!asesoramiento)
      throw new NotFoundException('Asesoramiento no encontrado');

    // Verificar si ya existe un contrato para este asesoramiento
    const contratoExistente = await this.contratoRepo.findOneBy({
      asesoramiento: { id: idAsesoramiento },
    });
    if (contratoExistente) {
      throw new BadRequestException(
        'Ya existe un contrato para este asesoramiento',
      );
    }

    // Asegurarse de que los objetos de tipo de trabajo y tipo de pago existen
    const tipoTrabajo = await this.tipoTrabajoRepo.findOneBy({
      id: dto.idTipoTrabajo,
    });
    if (!tipoTrabajo) throw new NotFoundException('TipoTrabajo no encontrado');

    const tipoPago = await this.tipoPagoRepo.findOneBy({ id: dto.idTipoPago });
    if (!tipoPago) throw new NotFoundException('TipoPago no encontrado');

    // Asegurarse de que categoria es opcional y puede ser null
    let categoria: Categoria | null = null; // Definir categoria con el tipo correcto
    if (dto.idCategoria) {
      categoria = await this.categoriaRepo.findOneBy({
        id: dto.idCategoria,
      });
      if (!categoria) throw new NotFoundException('Categoria no encontrada');
    }

    // Crear el contrato, ahora asignando las fechas si están presentes
    const contrato = this.contratoRepo.create({
      servicio: dto.servicio,
      modalidad: dto.modalidad,
      asesoramiento,
      tipoTrabajo,
      tipoPago,
      categoria, // Si no se pasa categoría, será null
      fecha_inicio: dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
      fecha_fin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
    });

    // Guardamos el contrato
    return this.contratoRepo.save(contrato);
  }

  // Método para actualizar contrato
  async updateContrato(idContrato: string, dto: UpdateContratoDto) {
    const contrato = await this.contratoRepo.findOne({
      where: { id: idContrato },
      relations: ['asesoramiento', 'tipoTrabajo', 'tipoPago', 'categoria'],
    });
    if (!contrato) throw new NotFoundException('Contrato no encontrado');

    // Actualizar campos si vienen en el DTO
    if (dto.servicio) contrato.servicio = dto.servicio;
    if (dto.modalidad) contrato.modalidad = dto.modalidad;

    if (dto.idTipoTrabajo) {
      const tipoTrabajo = await this.tipoTrabajoRepo.findOne({
        where: { id: dto.idTipoTrabajo },
      });
      if (!tipoTrabajo)
        throw new NotFoundException('TipoTrabajo no encontrado');
      contrato.tipoTrabajo = tipoTrabajo;
    }

    if (dto.idTipoPago) {
      const tipoPago = await this.tipoPagoRepo.findOne({
        where: { id: dto.idTipoPago },
      });
      if (!tipoPago) throw new NotFoundException('TipoPago no encontrado');
      contrato.tipoPago = tipoPago;
    }

    if (dto.idCategoria) {
      const categoria = await this.categoriaRepo.findOne({
        where: { id: dto.idCategoria },
      });
      if (!categoria) throw new NotFoundException('Categoria no encontrada');
      contrato.categoria = categoria;
    }

    // Actualizar fechas si vienen
    if (dto.fechaInicio) contrato.fecha_inicio = new Date(dto.fechaInicio);
    if (dto.fechaFin) contrato.fecha_fin = new Date(dto.fechaFin);

    return this.contratoRepo.save(contrato);
  }

  // Método para eliminar contrato
  async deleteContrato(idContrato: string) {
    const contrato = await this.contratoRepo.findOne({
      where: { id: idContrato },
    });
    if (!contrato) throw new NotFoundException('Contrato no encontrado');

    await this.contratoRepo.remove(contrato);
    return { message: 'Contrato eliminado correctamente' };
  }
}
