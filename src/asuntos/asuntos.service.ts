import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAsuntoDto } from './dto/create-asunto.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Asunto, Estado_asunto } from './entities/asunto.entity';
import { DocumentosService } from 'src/documentos/documentos.service';
import { Asesoramiento } from 'src/asesoramiento/entities/asesoramiento.entity';
import { ChangeToProcess } from './dto/change-to-process.dto';
import { archivosDataDto } from './dto/archivos-data.dto';
import { listFinished } from './dto/list-finished.dto';
import { UserRole } from 'src/usuario/usuario.entity';
import { ClienteService } from 'src/cliente/cliente.service';
import { AsesorService } from '../asesor/asesor.service';
import { BackbazeService } from 'src/backblaze/backblaze.service';
import { DIRECTORIOS } from 'src/backblaze/directorios.enum';
import { v4 as uuidv4 } from 'uuid';
import { UpdateAsuntoDto } from './dto/update-asunto.dto';

@Injectable()
export class AsuntosService {
  constructor(
    private readonly documentosService: DocumentosService,
    private readonly clienteService: ClienteService,
    private readonly asesorService: AsesorService,
    private readonly backblazeService: BackbazeService,

    @InjectRepository(Asunto)
    private asuntoRepo: Repository<Asunto>,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}
  async create(
    createAsuntoDto: CreateAsuntoDto,
    files: Express.Multer.File[],
    id_asesoramiento: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existAsesoramiento = queryRunner.manager.findOne(Asesoramiento, {
        where: { id: id_asesoramiento },
      });
      if (!existAsesoramiento) throw new Error('No existe este asesoramiento');
      const newAsunt = queryRunner.manager.create(Asunto, {
        ...createAsuntoDto,
        asesoramiento: { id: id_asesoramiento },
        estado: Estado_asunto.ENTREGADO,
        fecha_entregado: new Date(),
      });
      const { id } = await queryRunner.manager.save(newAsunt);

      const listNombres = await Promise.all(
        files.map(async (file) => {
          return await this.backblazeService.uploadFile(
            file,
            DIRECTORIOS.DOCUMENTOS,
          );
        }),
      );

      await Promise.all(
        listNombres.map(async (nameFile) => {
          const nombre = nameFile.split('/')[1];
          const directorio = `${nameFile}`;
          await this.documentosService.addedDocumentByClient(
            nombre,
            directorio,
            id,
            queryRunner.manager,
          );
        }),
      );

      await queryRunner.commitTransaction();
      return 'Agregado satisfactoriamente';
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return new InternalServerErrorException(
        `Se revierten los cambios,se presenta el siguiente error ${err.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async EstateToProcess(id: string, body: ChangeToProcess) {
    const exists = await this.asuntoRepo.findOneBy({ id });
    if (!exists)
      throw new NotFoundException('No se encontro un registro con ese id');
    if (exists.fecha_revision !== null)
      throw new BadRequestException('Ese asunto ya esta en proceso');

    const changeState = await this.asuntoRepo.update(id, {
      fecha_terminado: body.fecha_terminado,
      fecha_revision: new Date(),
      estado: Estado_asunto.PROCESO,
    });
    if (changeState.affected === 0)
      throw new NotFoundException('No se encontro un asunto con ese ID');
    return `Se actualizo las filas estado y fecha_revision del id:${id}`;
  }

  async finishAsunt(
    id: string,
    cambio_asunto: string,
    files: Express.Multer.File[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fecha_actual = new Date();
      const validateAsunt = await queryRunner.manager.findOne(Asunto, {
        where: { id },
        select: ['estado', 'fecha_revision'],
      });
      if (validateAsunt?.estado !== Estado_asunto.PROCESO)
        throw new BadRequestException(
          'No se puede modificar porque no esta en proceso',
        );
      if (validateAsunt.fecha_revision > fecha_actual)
        throw new BadRequestException('Estan mal las fechas');
      const finishedAsunt = await queryRunner.manager.update(
        Asunto,
        { id },
        {
          titulo: cambio_asunto,
          estado: Estado_asunto.TERMINADO,
          fecha_terminado: fecha_actual,
        },
      );

      const listNames = await Promise.all(
        files.map(async (file) => {
          return await this.backblazeService.uploadFile(
            file,
            DIRECTORIOS.DOCUMENTOS,
          );
        }),
      );
      await Promise.all(
        listNames.map(async (data) => {
          const nombre = data.split('/')[1];
          const fileData = {
            nombreDocumento: `${nombre}`,
            directorio: `${data}`,
          };
          await this.documentosService.finallyDocuments(
            id,
            fileData,
            queryRunner.manager,
          );
        }),
      );

      await queryRunner.commitTransaction();
      return 'Terminado el asunto satisfactoriamente';
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(`${err.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async getFinished(id: number) {
    const listFinished = await this.asuntoRepo.find({
      where: { estado: Estado_asunto.TERMINADO, asesoramiento: { id } },
      order: { fecha_entregado: 'DESC' },
      select: [
        'titulo',
        'fecha_entregado',
        'fecha_revision',
        'fecha_terminado',
        'estado',
      ],
    });

    if (!listFinished || listFinished.length === 0)
      throw new NotFoundException('No hay asuntos terminados.');

    for (const asunto of listFinished) {
      if (
        !asunto.titulo ||
        !asunto.fecha_entregado ||
        !asunto.fecha_revision ||
        !asunto.fecha_terminado
      ) {
        throw new BadRequestException(
          `Faltan datos en el asunto: ${JSON.stringify(asunto)}`,
        );
      }
    }
    const response: listFinished[] = listFinished.map((asunto) => {
      return {
        titulo: asunto.titulo,
        fecha_entregado: asunto.fecha_entregado,
        fecha_proceso: asunto.fecha_revision,
        fecha_terminado: asunto.fecha_terminado,
        estado: asunto.estado,
      };
    });
    return response;
  }

  async getAll(id: number) {
    const listAll = await this.asuntoRepo
      .createQueryBuilder('asun')
      .innerJoinAndSelect('asun.documentos', 'doc')
      .innerJoin('asun.asesoramiento', 'ase')
      .where('ase.id=:id', { id })
      .andWhere('asun.estado IN (:...estados)', {
        estados: [Estado_asunto.ENTREGADO, Estado_asunto.PROCESO],
      })
      .select([
        'asun.id AS id_asunto',
        'asun.titulo AS Titulo',
        'asun.estado AS Estado',
        'asun.fecha_entregado AS Fecha_entregado',
        'ase.profesion_asesoria AS profesion_asesoria',
        'asun.fecha_revision AS Fecha_revision',
        'asun.fecha_terminado AS Fecha_terminado',
        'doc.nombre AS Documento_nombre',
      ])
      .orderBy('asun.fecha_entregado', 'ASC')
      .getRawMany();

    if (!listAll || listAll.length === 0)
      throw new NotFoundException('No se encontro');

    let idUsados: number[] = [];
    let arregloAsuntos: object[] = [];
    let contador_alumnos = 0;
    let contador_columnas = -1;

    for (let i = 0; i < listAll.length; i++) {
      const documento = listAll[i];

      if (contador_alumnos >= 2) {
        break;
      }
      console.log(contador_alumnos);
      if (idUsados.includes(documento.id_asunto)) {
        arregloAsuntos[contador_columnas] = {
          ...arregloAsuntos[contador_columnas],
          [`documento_${contador_alumnos}`]: documento.Documento_nombre,
        };
      } else {
        contador_columnas += 1;
        contador_alumnos = 1;
        arregloAsuntos[contador_columnas] = {
          id_asunto: documento.id_asunto,
          titulo: documento.Titulo,
          estado: documento.Estado,
          fecha_entrega: documento.Fecha_entregado,
          profesion_asesoria: documento.profesion_asesoria,
          fecha_revision: documento.Fecha_revision,
          fecha_terminado: documento.Fecha_terminado,
          documento_0: documento.Documento_nombre,
        };
        idUsados.push(documento.id_asunto);
      }
    }
    return arregloAsuntos;
  }

  async listarFechasEntregas(id: number) {
    const fechasEntregaProceso = await this.asuntoRepo.find({
      where: { asesoramiento: { id }, estado: Estado_asunto.PROCESO },
      select: ['fecha_terminado'],
    });
    if (fechasEntregaProceso.length === 0)
      throw new NotFoundException(
        'No se encontro fechas proximas para ese id asesoramiento',
      );

    let fechasEntrega: object[] = [];
    for (let fecha of fechasEntregaProceso) {
      const objectFecha = {
        fecha_entrega: `${fecha.fecha_terminado.toISOString()}`,
      };
      fechasEntrega.push(objectFecha);
    }
    return fechasEntrega;
  }

  async asuntosCalendarioEstudiante(id_asesoramiento: number, fecha: Date) {
    const asuntosByFecha = await this.asuntoRepo.find({
      where: { asesoramiento: { id: id_asesoramiento } },
      select: [
        'estado',
        'fecha_entregado',
        'fecha_revision',
        'fecha_terminado',
        'titulo',
        'id',
      ],
    });

    const mismaFecha = (a: Date | null | undefined, b: Date) =>
      a instanceof Date &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
    const delegado = await this.clienteService.getDelegado(id_asesoramiento);

    const responseAsuntos = asuntosByFecha
      .map((asunto) => {
        if (
          asunto.estado === Estado_asunto.ENTREGADO &&
          mismaFecha(asunto.fecha_entregado, fecha)
        ) {
          return {
            id: `${asunto.id}`,
            titulo: asunto.titulo,
            delegado: delegado.nombre_delegado,
            fecha_y_hora: asunto.fecha_entregado,
            estado: asunto.estado,
          };
        }

        if (
          asunto.estado === Estado_asunto.PROCESO &&
          mismaFecha(asunto.fecha_revision, fecha)
        ) {
          return {
            id: `${asunto.id}`,
            titulo: asunto.titulo,
            delegado: delegado,
            fecha_revision: asunto.fecha_revision,
            message: 'Esta en revisión por el asesor',
          };
        }

        if (
          asunto.estado === Estado_asunto.PROCESO &&
          mismaFecha(asunto.fecha_terminado, fecha)
        ) {
          return {
            id: `${asunto.id}`,
            titulo: asunto.titulo,
            delegado: delegado,
            fecha_terminado: asunto.fecha_terminado,
            message: 'Fecha estimada de envio del asesor',
          };
        }

        if (
          asunto.estado === Estado_asunto.TERMINADO &&
          mismaFecha(asunto.fecha_terminado, fecha)
        ) {
          return {
            id: `${asunto.id}`,
            titulo: asunto.titulo,
            delegado: delegado,
            'fecha y hora': asunto.fecha_entregado,
            estado: asunto.estado,
          };
        }

        return null;
      })
      .filter(Boolean); // elimina los nulls

    console.log(responseAsuntos);
    return responseAsuntos;
  }

  async asuntosCalendarioAsesor(id_asesoramiento: number, fecha: Date) {
    const asuntosByFecha = await this.asuntoRepo.find({
      where: { asesoramiento: { id: id_asesoramiento } },
      select: [
        'estado',
        'fecha_entregado',
        'fecha_revision',
        'fecha_terminado',
        'titulo',
        'id',
      ],
    });

    const mismaFecha = (a: Date | null | undefined, b: Date) =>
      a instanceof Date &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
    const asesor =
      await this.asesorService.getDatosAsesorByAsesoramiento(id_asesoramiento);
    const nombre_asesor = `${asesor.nombre} ${asesor.apellido}`;

    const responseAsuntos = asuntosByFecha
      .map((asunto) => {
        if (
          asunto.estado === Estado_asunto.ENTREGADO &&
          mismaFecha(asunto.fecha_entregado, fecha)
        ) {
          return {
            id: `${asunto.id}`,
            titulo: asunto.titulo,
            asesor: nombre_asesor,
            fecha_y_hora: asunto.fecha_entregado,
            estado: asunto.estado,
          };
        }

        return null;
      })
      .filter(Boolean); // elimina los nulls

    console.log(responseAsuntos);
    return responseAsuntos;
  }

  async updateAsunto(id: string, updateAsuntoDto: UpdateAsuntoDto) {
    const asunto = await this.asuntoRepo.findOne({ where: { id } });

    if (!asunto)
      throw new NotFoundException(`No se encontró un asunto con el id ${id}`);

    const updateAsunto = await this.asuntoRepo.update(id, updateAsuntoDto);
    return updateAsunto;
  }

  async eliminarAsunto(id: string) {
    const asunto = await this.asuntoRepo.findOne({ where: { id } });

    if (!asunto)
      throw new NotFoundException(`No se encontró un asunto con el id ${id}`);

    await this.asuntoRepo.delete(id);
    
    return {
      statusCode: 200,
      success: true,
      data: {
        id: asunto.id,
      },
      message: `El asunto con el id ${id} ha sido eliminado correctamente.`,
    };
  }
}
