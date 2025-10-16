import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAsuntoDto } from './dto/create-asunto.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
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
import { Cliente } from 'src/cliente/cliente.entity';
import { v4 as uuidv4 } from 'uuid';
import { UpdateAsuntoDto } from './dto/update-asunto.dto';
import { Documento, Subido } from 'src/documentos/entities/documento.entity';
import { NotificacionesService } from 'src/notificaciones/notificacion.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AsuntosService {
  constructor(
    private readonly documentosService: DocumentosService,
    private readonly clienteService: ClienteService,
    private readonly asesorService: AsesorService,
    private readonly backblazeService: BackbazeService,
    private readonly notificacionesService: NotificacionesService,
    private readonly mailService: MailService,

    @InjectRepository(Asunto)
    private asuntoRepo: Repository<Asunto>,

    @InjectRepository(Documento)
    private documentoRepo: Repository<Documento>,

    @InjectDataSource()
    private readonly dataSource: DataSource,

    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
  ) {}

  async create(
    createAsuntoDto: CreateAsuntoDto,
    files: Express.Multer.File[],
    id_asesoramiento: number,
    user: any, // 👈 se obtiene de @Req() en el controlador
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existAsesoramiento = await queryRunner.manager.findOne(
        Asesoramiento,
        {
          where: { id: id_asesoramiento },
          relations: [
            'procesosasesoria',
            'procesosasesoria.cliente',
            'procesosasesoria.asesor',
            'contrato',
          ],
        },
      );

      if (!existAsesoramiento) {
        throw new NotFoundException('No existe este asesoramiento');
      }

      const newAsunt = queryRunner.manager.create(Asunto, {
        ...createAsuntoDto,
        asesoramiento: { id: id_asesoramiento },
        estado: Estado_asunto.ENTREGADO,
        fecha_entregado: new Date(),
      });

      const { id } = await queryRunner.manager.save(newAsunt);

      // Subida de archivos y registro
      if (files && files.length > 0) {
        const listNombres = await Promise.all(
          files.map((file) =>
            this.backblazeService.uploadFile(file, DIRECTORIOS.DOCUMENTOS),
          ),
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
      }

      await queryRunner.commitTransaction();

      //  Notificación al asesor (único)
      const contrato = existAsesoramiento.contrato;
      const procesos = existAsesoramiento.procesosasesoria || [];
      const asesor = procesos.find((p) => p.asesor)?.asesor;

      //  Buscar el cliente asociado al usuario autenticado
      const cliente = await this.clienteRepo.findOne({
        where: { usuario: { id: user.id } },
      });

      if (asesor && cliente) {
        console.log('📢 Cliente autenticado (emisor):', cliente.id);

        await this.notificacionesService.notificarAsesor(
          asesor.id, // receptor (asesor)
          contrato?.id,
          `El cliente ha agregado un nuevo avance en el asesoramiento "${existAsesoramiento.profesion_asesoria}".`,
          'nuevo_avance',
          { idClienteEmisor: cliente.id }, // ✅ ahora el ID real del cliente, no del usuario
        );
      }

      return 'Asunto agregado y notificación enviada al asesor satisfactoriamente';
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `Se revierten los cambios: ${err.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async EstateToProcess(id: string, body: ChangeToProcess) {
    console.log('📩 Llega desde front (string):', body.fecha_estimada);

    const fechaValida = new Date(body.fecha_estimada);

    if (isNaN(fechaValida.getTime())) {
      throw new BadRequestException('Fecha estimada inválida');
    }

    console.log(
      '🕑 Parseada en backend (Date real):',
      fechaValida.toISOString(),
    );

    try {
      // 🔎 Usamos QueryBuilder en vez de update()
      const result = await this.asuntoRepo
        .createQueryBuilder()
        .update()
        .set({
          fecha_estimada: fechaValida,
          fecha_revision: new Date(),
          estado: Estado_asunto.PROCESO,
        })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0) {
        throw new NotFoundException(`No se encontró un asunto con id: ${id}`);
      }

      console.log('📤 Guardando en BD:', {
        fecha_estimada: fechaValida.toISOString(),
        fecha_revision: new Date().toISOString(),
        estado: Estado_asunto.PROCESO,
      });

      return {
        status: 200,
        success: true,
        message: `Se actualizó el asunto ${id}`,
      };
    } catch (err) {
      console.error('❌ Error al actualizar el asunto:', err);
      throw new InternalServerErrorException(
        'Hubo un error al actualizar el asunto.',
      );
    }
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
        relations: [
          'asesoramiento',
          'asesoramiento.contrato',
          'asesoramiento.clientes',
          'asesoramiento.asesores',
        ],
        select: ['id', 'estado', 'fecha_revision'],
      });

      if (!validateAsunt) {
        throw new NotFoundException('Asunto no encontrado');
      }

      if (validateAsunt.fecha_revision > fecha_actual) {
        throw new BadRequestException('Las fechas son inválidas');
      }

      // ✅ Actualiza el asunto
      await queryRunner.manager.update(
        Asunto,
        { id },
        {
          titulo_asesor: cambio_asunto,
          estado: Estado_asunto.TERMINADO,
          fecha_terminado: fecha_actual,
        },
      );

      // ✅ Subida de documentos si existen
      if (files && files.length > 0) {
        const listNames = await Promise.all(
          files.map((file) =>
            this.backblazeService.uploadFile(file, DIRECTORIOS.DOCUMENTOS),
          ),
        );

        await Promise.all(
          listNames.map(async (data) => {
            const nombre = data.split('/')[1];
            const fileData = {
              nombreDocumento: nombre,
              directorio: data,
            };

            await this.documentosService.finallyDocuments(
              id,
              fileData,
              queryRunner.manager,
            );
          }),
        );
      }

      await queryRunner.commitTransaction();

      // 🟢 ⏱️ NOTIFICACIÓN después del commit
      const asesoramiento = validateAsunt.asesoramiento;
      const contrato = asesoramiento?.contrato;
      const idAsesor = asesoramiento?.asesores?.[0]?.id;
      const nombreAsesor = asesoramiento?.asesores?.[0]?.nombre;
      const profesion = asesoramiento?.profesion_asesoria;

      if (asesoramiento && contrato && idAsesor) {
        // 🔔 Notificación interna (persistente y por gateway)
        await this.notificacionesService.notificarClientesDeAsesoramiento(
          asesoramiento.id,
          contrato.id,
          `El asesor ha enviado un nuevo avance en tu asesoría. Revisa los documentos actualizados en la plataforma.`,
          'avance_enviado',
          { idAsesorEmisor: idAsesor },
        );

        // 📧 Envío de correo a los clientes asociados
        const clientes = asesoramiento?.clientes || [];

        for (const cliente of clientes) {
          if (!cliente?.email) continue;

          try {
            await this.mailService.sendAvanceClienteEmail(
              cliente.email,
              nombreAsesor || 'Tu asesor',
              profesion || 'Tu asesoría',
            );
            console.log(`📬 Correo enviado correctamente a ${cliente.email}`);
          } catch (error) {
            console.error(
              `❌ Error enviando correo a ${cliente.email}:`,
              error.message,
            );
          }
        }
      }

      return 'Asunto terminado y notificaciones (internas + correo) enviadas correctamente';
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err.message || 'Error interno');
    } finally {
      await queryRunner.release();
    }
  }

  async getFinished(id: number) {
    const listFinished = await this.asuntoRepo.find({
      where: { estado: Estado_asunto.TERMINADO, asesoramiento: { id } },
      order: { fecha_entregado: 'DESC' },
      select: [
        'id',
        'titulo_asesor',
        'fecha_entregado',
        'fecha_revision',
        'fecha_terminado',
        'estado',
      ],
    });
    // ✅ Si no hay datos, retornamos un array vacío
    if (!listFinished || listFinished.length === 0) {
      return [];
    }

    // Mapeo de la respuesta
    const response: listFinished[] = listFinished.map((asunto) => {
      return {
        id: asunto.id,
        titulo_asesor: asunto.titulo_asesor,
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
      .where('ase.id = :id', { id })
      .andWhere('asun.estado IN (:...estados)', {
        estados: [Estado_asunto.ENTREGADO, Estado_asunto.PROCESO],
      })
      .select([
        'asun.id AS id_asunto',
        'asun.titulo AS titulo',
        'asun.estado AS estado',
        'asun.fecha_entregado AS fecha_entrega',
        'ase.profesion_asesoria AS profesion_asesoria',
        'asun.fecha_revision AS fecha_revision',
        'asun.fecha_estimada AS fecha_estimada',
        'asun.fecha_terminado AS fecha_terminado',
        'doc.nombre AS documento_nombre',
      ])
      .orderBy('asun.fecha_entregado', 'ASC')
      .getRawMany();

    if (!listAll || listAll.length === 0) {
      return [];
    }

    let idUsados: string[] = [];
    let arregloAsuntos: any[] = [];
    let contador_alumnos = 0;
    let contador_columnas = -1;

    for (let i = 0; i < listAll.length; i++) {
      const documento = listAll[i];

      if (contador_alumnos >= 2) {
        break;
      }

      if (idUsados.includes(documento.id_asunto)) {
        arregloAsuntos[contador_columnas] = {
          ...arregloAsuntos[contador_columnas],
          [`documento_${contador_alumnos}`]: documento.documento_nombre,
        };
      } else {
        contador_columnas += 1;
        contador_alumnos = 1;
        arregloAsuntos[contador_columnas] = {
          id_asunto: documento.id_asunto,
          titulo: documento.titulo,
          estado: documento.estado,
          fecha_entrega: documento.fecha_entrega,
          profesion_asesoria: documento.profesion_asesoria,
          fecha_revision: documento.fecha_revision,
          fecha_estimada: documento.fecha_estimada,
          fecha_terminado: documento.fecha_terminado,
          documento_0: documento.documento_nombre,
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

  async updateAsunto(
    id: string,
    updateAsuntoDto: UpdateAsuntoDto,
    files: Express.Multer.File[],
  ) {
    const asunto = await this.asuntoRepo.findOne({ where: { id } });

    if (!asunto) {
      throw new NotFoundException(`No se encontró un asunto con el id ${id}`);
    }

    // Verifica que se esté enviando el título del asesor
    console.log('Actualizando asunto con datos:', updateAsuntoDto);

    const idsArray = updateAsuntoDto.idsElminar ?? [];

    // 🔴 Eliminar documentos si hay IDs
    if (idsArray.length > 0) {
      const documentos = await this.documentoRepo
        .createQueryBuilder()
        .where('id IN (:...ids)', { ids: idsArray })
        .select(['id', 'ruta'])
        .getRawMany();

      // Eliminar en Backblaze
      await Promise.all(
        documentos.map(async (doc: any) => {
          await this.backblazeService.deleteFile(doc.ruta);
        }),
      );

      // Eliminar en BD
      await this.documentoRepo
        .createQueryBuilder()
        .delete()
        .where('id IN (:...ids)', { ids: idsArray })
        .execute();
    }

    // 🟢 Subida de archivos nuevos
    if (files && files.length > 0) {
      const listNombres = await Promise.all(
        files.map(async (file) => {
          return await this.backblazeService.uploadFile(
            file,
            DIRECTORIOS.DOCUMENTOS,
          );
        }),
      );

      await this.documentoRepo
        .createQueryBuilder()
        .insert()
        .into(Documento)
        .values(
          listNombres.map((nameFile) => {
            const nombre = nameFile.split('/')[1];
            return {
              nombre,
              ruta: nameFile,
              subido_por: updateAsuntoDto.subido_por ?? Subido.ASESOR,
              created_at: new Date(),
              asunto: { id },
            };
          }),
        )
        .execute();
    }

    // 🟡 Actualizar campos del Asunto
    try {
      await this.asuntoRepo.update(id, {
        titulo_asesor: updateAsuntoDto.titulo_asesor, // Asegúrate de que este valor no sea vacío o null
      });
    } catch (error) {
      console.error('Error al actualizar el asunto:', error);
      throw new InternalServerErrorException('Error al actualizar el asunto');
    }

    return {
      statusCode: 200,
      success: true,
      asunto: await this.asuntoRepo.findOne({ where: { id } }),
    };
  }
  async updateAsuntoEstudiante(
    id: string,
    updateAsuntoDto: UpdateAsuntoDto,
    files: Express.Multer.File[],
  ) {
    const asunto = await this.asuntoRepo.findOne({ where: { id } });

    if (!asunto) {
      throw new NotFoundException(`No se encontró un asunto con el id ${id}`);
    }

    // Verifica que se esté enviando el título del asesor
    console.log('Actualizando asunto con datos:', updateAsuntoDto);

    const idsArray = updateAsuntoDto.idsElminar ?? [];

    // 🔴 Eliminar documentos si hay IDs
    if (idsArray.length > 0) {
      const documentos = await this.documentoRepo
        .createQueryBuilder()
        .where('id IN (:...ids)', { ids: idsArray })
        .select(['id', 'ruta'])
        .getRawMany();

      // Eliminar en Backblaze
      await Promise.all(
        documentos.map(async (doc: any) => {
          await this.backblazeService.deleteFile(doc.ruta);
        }),
      );

      // Eliminar en BD
      await this.documentoRepo
        .createQueryBuilder()
        .delete()
        .where('id IN (:...ids)', { ids: idsArray })
        .execute();
    }

    // 🟢 Subida de archivos nuevos
    if (files && files.length > 0) {
      const listNombres = await Promise.all(
        files.map(async (file) => {
          return await this.backblazeService.uploadFile(
            file,
            DIRECTORIOS.DOCUMENTOS,
          );
        }),
      );

      await this.documentoRepo
        .createQueryBuilder()
        .insert()
        .into(Documento)
        .values(
          listNombres.map((nameFile) => {
            const nombre = nameFile.split('/')[1];
            return {
              nombre,
              ruta: nameFile,
              subido_por: updateAsuntoDto.subido_por ?? Subido.ASESOR,
              created_at: new Date(),
              asunto: { id },
            };
          }),
        )
        .execute();
    }

    // 🟡 Actualizar campos del Asunto
    try {
      await this.asuntoRepo.update(id, {
        titulo: updateAsuntoDto.titulo, // Asegúrate de que este valor no sea vacío o null
      });
    } catch (error) {
      console.error('Error al actualizar el asunto:', error);
      throw new InternalServerErrorException('Error al actualizar el asunto');
    }

    return {
      statusCode: 200,
      success: true,
      asunto: await this.asuntoRepo.findOne({ where: { id } }),
    };
  }

  async eliminarAsunto(id: string) {
    const asunto = await this.asuntoRepo.findOne({ where: { id } });

    if (!asunto)
      throw new NotFoundException(`No se encontró un asunto con el id ${id}`);

    const documentosEliminados =
      await this.documentosService.deleteDocumentosByIdAsunto(id);
    if (!documentosEliminados)
      throw new NotFoundException(
        `No se pudo eliminar los documentos con el asunto ${id}`,
      );

    await this.asuntoRepo.delete(id);

    return {
      statusCode: 200,
      success: true,
      // documentosEliminados,
      message: `El asunto con el id ${id} ha sido eliminado correctamente.`,
    };
  }

  async getAsuntoById(id: string) {
    console.log(id);
    const asunto = await this.asuntoRepo.findOne({
      where: { id },
      relations: ['asesoramiento', 'documentos'],
    });

    if (!asunto)
      throw new NotFoundException(`No se encontró un asunto con el id ${id}`);

    return {
      statusCode: 200,
      success: true,
      asunto,
    };
  }

  async getAsuntosTerminadosAsesor(id: string) {
    console.log('getAsuntosTerminadosAsesor');

    const asunto = await this.asuntoRepo
      .createQueryBuilder('asun')
      .leftJoinAndSelect('asun.asesoramiento', 'ase')
      .leftJoinAndSelect(
        'asun.documentos',
        'doc',
        'doc.subido_por = :subidoPor',
        { subidoPor: 'asesor' },
      )
      .where('asun.id =:id', { id })
      .getOne();

    if (!asunto)
      throw new NotFoundException(`No se encontró un asunto con el id ${id}`);

    return {
      statusCode: 200,
      success: true,
      asunto,
    };
  }

  async editarFechaAsuntoPendiente(id: string, body: any) {
    console.log('📩 ID:', id);
    console.log('📩 BODY CRUDO:', body);
    console.log('📩 BODY.fecha_estimada:', body.fecha_estimada);

    if (!body.fecha_estimada) {
      throw new BadRequestException('El campo fecha_estimada es obligatorio');
    }

    // ✅ Forzar a string y validar antes de new Date
    const fechaStr: string = String(body.fecha_estimada);
    const fechaEstimada = new Date(fechaStr);

    if (isNaN(fechaEstimada.getTime())) {
      throw new BadRequestException(
        `La fecha '${fechaStr}' no es válida. Formato esperado: YYYY-MM-DDTHH:mm:ss.sssZ`,
      );
    }

    console.log('🕑 Fecha parseada (Date):', fechaEstimada);
    console.log('🕑 ISO final que se guardará:', fechaEstimada.toISOString());

    try {
      const result = await this.asuntoRepo
        .createQueryBuilder()
        .update()
        .set({ fecha_estimada: fechaEstimada })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0) {
        throw new NotFoundException(`No se encontró el asunto con id: ${id}`);
      }

      return {
        status: 200,
        success: true,
        message: `Fecha estimada actualizada correctamente para el asunto ${id}`,
        fecha_estimada: fechaEstimada.toISOString(),
      };
    } catch (err) {
      console.error('❌ Error al actualizar la fecha estimada:', err);
      throw new InternalServerErrorException(
        'Hubo un error al actualizar la fecha estimada.',
      );
    }
  }
}
