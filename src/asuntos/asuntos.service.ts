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
import { AuditoriaAsesoria } from 'src/auditoria/entities/auditoria-asesoria.entity';
import { ProcesosAsesoria } from 'src/procesos_asesoria/entities/procesos_asesoria.entity';

@Injectable()
export class AsuntosService {
  constructor(
    private readonly documentosService: DocumentosService,
    private readonly clienteService: ClienteService,
    private readonly asesorService: AsesorService,
    private readonly backblazeService: BackbazeService,
    private readonly notificacionesService: NotificacionesService,
    private readonly mailService: MailService,

    @InjectRepository(AuditoriaAsesoria)
    private readonly auditoriaRepo: Repository<AuditoriaAsesoria>,
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
    user: any,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 🔍 1. Validar que el asesoramiento exista y traer todas las relaciones necesarias
      const existAsesoramiento = await queryRunner.manager.findOne(
        Asesoramiento,
        {
          where: { id: id_asesoramiento },
          relations: [
            'procesosasesoria',
            'procesosasesoria.cliente',
            'procesosasesoria.asesor',
            'procesosasesoria.asesor.usuario', // ✅ ahora sí trae el usuario del asesor
            'contrato',
          ],
        },
      );

      if (!existAsesoramiento) {
        throw new NotFoundException('No existe este asesoramiento');
      }

      // 🆕 2. Crear el nuevo Asunto
      const newAsunto = queryRunner.manager.create(Asunto, {
        ...createAsuntoDto,
        asesoramiento: { id: id_asesoramiento },
        estado: Estado_asunto.ENTREGADO,
        fecha_entregado: new Date(),
      });

      const { id } = await queryRunner.manager.save(newAsunto);

      // ✅ 3. Confirmar transacción antes de usar servicios externos
      await queryRunner.commitTransaction();

      // 🚀 4. Subida de archivos (fuera de la transacción)
      if (files && files.length > 0) {
        try {
          const listNombres = await Promise.all(
            files.map((file) =>
              this.backblazeService.uploadFile(file, DIRECTORIOS.DOCUMENTOS),
            ),
          );

          for (const nameFile of listNombres) {
            const nombre = nameFile.split('/')[1];
            const directorio = `${nameFile}`;
            await this.documentosService.addedDocumentByClient(
              nombre,
              directorio,
              id,
              this.dataSource.manager,
            );
          }
        } catch (uploadError) {
          console.warn(
            '⚠️ Archivos subidos parcialmente o con error:',
            uploadError.message,
          );
        }
      }

      // 🔔 5. Envío de notificación al asesor
      try {
        const contrato = existAsesoramiento.contrato;
        const procesos = existAsesoramiento.procesosasesoria || [];
        const asesor = procesos.find((p) => p.asesor)?.asesor;
        const idUsuario = user.id_usuario || user.sub || user.id;

        const cliente = await this.clienteRepo.findOne({
          where: { usuario: { id: idUsuario } },
          relations: ['usuario'],
        });

        console.log('🔍 Datos para notificar:', {
          asesor_id: asesor?.id,
          asesor_usuario_id: asesor?.usuario?.id,
          cliente_id: cliente?.id,
          contrato_id: contrato?.id,
          idUsuario,
        });

        if (asesor?.id && asesor?.usuario?.id && cliente?.id) {
          await this.notificacionesService.notificarAsesor(
            asesor.id, // 👈 ID del asesor (FK en notificaciones)
            asesor.usuario.id, // 👈 ID del usuario (para socket)
            contrato?.id ?? null,
            `El cliente ha agregado un nuevo avance en el asesoramiento "${existAsesoramiento.profesion_asesoria}".`,
            'nuevo_avance',
            { idClienteEmisor: cliente.id },
          );
          console.log('✅ Notificación enviada correctamente');
        } else {
          console.warn(
            '⚠️ No se pudo enviar notificación: faltan datos para asesor o cliente',
          );
        }
      } catch (notifError) {
        console.warn('⚠️ No se pudo enviar notificación:', notifError.message);
      }

      return {
        message:
          'Asunto agregado y notificación enviada al asesor satisfactoriamente',
        id_asunto: id,
      };
    } catch (err) {
      // 🩹 6. Manejo de errores con rollback seguro
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      console.error('❌ Error en create():', err);
      throw new InternalServerErrorException(
        `Error al agregar los archivos: ${err.message}`,
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

      // 🔍 Validar existencia del asunto con relaciones REALES
      const validateAsunt = await queryRunner.manager.findOne(Asunto, {
        where: { id },
        relations: [
          'asesoramiento',
          'asesoramiento.contrato',
          'asesoramiento.procesosasesoria',
          'asesoramiento.procesosasesoria.cliente',
          'asesoramiento.procesosasesoria.asesor',
        ],
        select: ['id', 'estado', 'fecha_revision'],
      });

      if (!validateAsunt) throw new NotFoundException('Asunto no encontrado');

      if (
        validateAsunt.fecha_revision &&
        validateAsunt.fecha_revision > fecha_actual
      ) {
        throw new BadRequestException('Las fechas son inválidas');
      }

      // ✅ Actualizar estado y título del asunto
      await queryRunner.manager.update(
        Asunto,
        { id },
        {
          titulo_asesor: cambio_asunto,
          estado: Estado_asunto.TERMINADO,
          fecha_terminado: fecha_actual,
        },
      );

      // ✅ Subida de documentos (sí esperamos esto)
      if (files?.length) {
        const rutasSubidas = await Promise.all(
          files.map((file) =>
            this.backblazeService.uploadFile(file, DIRECTORIOS.DOCUMENTOS),
          ),
        );

        await Promise.allSettled(
          rutasSubidas.map(async (ruta) => {
            const nombre = ruta.split('/')[1];
            const fileData = { nombreDocumento: nombre, directorio: ruta };
            await this.documentosService.finallyDocuments(
              id,
              fileData,
              queryRunner.manager,
            );
          }),
        );
      }

      // 🧾 Registrar auditoría mínima
      const asesoramiento = validateAsunt.asesoramiento;
      const procesoDelegado = await queryRunner.manager.findOne(
        ProcesosAsesoria,
        {
          where: { asesoramiento: { id: asesoramiento.id }, esDelegado: true },
          relations: ['asesor'],
        },
      );

      if (procesoDelegado) {
        const auditoria = queryRunner.manager.create(AuditoriaAsesoria, {
          procesoAsesoria: procesoDelegado,
          asesor: procesoDelegado.asesor,
          tipo: 'Archivo',
          accion: 'Agregó un avance',
          descripcion: `El asesor finalizó el asunto "${cambio_asunto}" en la asesoría ${asesoramiento.id}.`,
          detalle: 'Se cargaron los avances y se notificó a los clientes.',
        });
        await queryRunner.manager.save(AuditoriaAsesoria, auditoria);
      }

      // ✅ Confirmar transacción (solo datos críticos)
      await queryRunner.commitTransaction();

      // ⚡ Responder inmediatamente al front
      const respuesta = {
        message:
          '✅ Asunto finalizado y documentos subidos. Notificaciones y correos se enviarán en segundo plano.',
      };

      // 🚀 Tareas en background (no bloquean el flujo principal)
      setImmediate(async () => {
        try {
          const contrato = asesoramiento?.contrato ?? null;
          const procesos = asesoramiento?.procesosasesoria || [];
          const asesor = procesos.find((p) => p?.asesor)?.asesor || null;
          const clientes = procesos
            .map((p) => p?.cliente)
            .filter((c) => c && c.email);

          if (!asesor || clientes.length === 0) {
            console.warn(
              '⚠️ Sin notificaciones: faltan datos de asesor o clientes.',
            );
            return;
          }

          const nombreAsesor = asesor.nombre || 'Tu asesor';
          const profesion = asesoramiento.profesion_asesoria || 'Tu asesoría';
          const mensajeNoti = `El asesor ${nombreAsesor} ha finalizado el asunto "${cambio_asunto}". Revisa los documentos actualizados en la plataforma.`;

          // 🧩 Ejecutar procesos en paralelo
          await Promise.allSettled([
            // 📩 Notificación interna (persistente + socket)
            this.notificacionesService
              .notificarClientesDeAsesoramiento(
                asesoramiento.id,
                contrato?.id ?? null,
                mensajeNoti,
                'avance_enviado',
                { idAsesorEmisor: asesor.id },
              )
              .then(() =>
                console.log(
                  `✅ Notificaciones enviadas a ${clientes.length} clientes.`,
                ),
              )
              .catch((err) =>
                console.error('⚠️ Error enviando notificaciones:', err.message),
              ),

            // 📧 Envío de correos (en paralelo)
            ...clientes.map((cliente) =>
              this.mailService
                .sendAvanceClienteEmail(cliente.email, nombreAsesor, profesion)
                .then(() =>
                  console.log(
                    `📬 Correo enviado correctamente a ${cliente.email}`,
                  ),
                )
                .catch((err) =>
                  console.error(
                    `❌ Error enviando correo a ${cliente.email}:`,
                    err.message,
                  ),
                ),
            ),
          ]);
        } catch (err) {
          console.error('⚠️ Error en proceso asíncrono:', err);
        }
      });

      return respuesta;
    } catch (err) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();
      console.error('❌ Error en finishAsunt():', err);
      throw new InternalServerErrorException(
        err.message || 'Error interno al finalizar el asunto',
      );
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
    files?: Express.Multer.File[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fecha_actual = new Date();

      // 🔍 1. Buscar el asunto con relaciones REALES
      const asunto = await queryRunner.manager.findOne(Asunto, {
        where: { id },
        relations: [
          'asesoramiento',
          'asesoramiento.contrato',
          'asesoramiento.procesosasesoria',
          'asesoramiento.procesosasesoria.cliente',
          'asesoramiento.procesosasesoria.asesor',
        ],
      });

      if (!asunto) {
        throw new NotFoundException(`No se encontró un asunto con el id ${id}`);
      }

      console.log('🛠️ Actualizando asunto con:', updateAsuntoDto);

      // 🔴 2. Eliminar documentos seleccionados (si los hay)
      const idsEliminar = updateAsuntoDto.idsElminar ?? [];

      if (idsEliminar.length > 0) {
        const documentos = await queryRunner.manager
          .createQueryBuilder(Documento, 'doc')
          .select(['doc.id', 'doc.ruta'])
          .where('doc.id IN (:...ids)', { ids: idsEliminar })
          .getRawMany();

        // Eliminar de Backblaze (en paralelo)
        await Promise.allSettled(
          documentos.map(async (doc: any) => {
            try {
              await this.backblazeService.deleteFile(doc.ruta);
            } catch (error) {
              console.warn(
                `⚠️ Error al eliminar archivo ${doc.ruta}:`,
                error.message,
              );
            }
          }),
        );

        // Eliminar en BD
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from(Documento)
          .where('id IN (:...ids)', { ids: idsEliminar })
          .execute();
      }

      // 🟢 3. Subida de nuevos archivos
      if (files && files.length > 0) {
        const rutasSubidas = await Promise.all(
          files.map((file) =>
            this.backblazeService.uploadFile(file, DIRECTORIOS.DOCUMENTOS),
          ),
        );

        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(Documento)
          .values(
            rutasSubidas.map((ruta) => ({
              nombre: ruta.split('/')[1],
              ruta,
              subido_por: updateAsuntoDto.subido_por ?? Subido.ASESOR,
              created_at: fecha_actual,
              asunto: { id },
            })),
          )
          .execute();
      }

      // 🟡 4. Actualizar título del asesor
      const nuevoTitulo = updateAsuntoDto.titulo_asesor?.trim();
      if (!nuevoTitulo) {
        throw new BadRequestException(
          'El título del asesor no puede estar vacío',
        );
      }

      await queryRunner.manager.update(
        Asunto,
        { id },
        { titulo_asesor: nuevoTitulo },
      );

      // 🟣 5. Registrar auditoría básica
      const asesoramiento = asunto.asesoramiento;
      const procesoDelegado = await queryRunner.manager.findOne(
        ProcesosAsesoria,
        {
          where: {
            asesoramiento: { id: asesoramiento.id },
            esDelegado: true,
          },
          relations: ['asesor'],
        },
      );

      if (procesoDelegado) {
        const auditoria = queryRunner.manager.create(AuditoriaAsesoria, {
          procesoAsesoria: procesoDelegado,
          asesor: procesoDelegado.asesor,
          tipo: 'Archivo',
          accion: 'Actualizó un asunto',
          descripcion: `El asesor actualizó el asunto "${nuevoTitulo}" en la asesoría ${asesoramiento.id}.`,
          detalle:
            'Se actualizaron los documentos y se notificó a los clientes.',
        });
        await queryRunner.manager.save(AuditoriaAsesoria, auditoria);
      }

      // 🟢 6. Confirmar transacción
      await queryRunner.commitTransaction();

      // ⚡ Responder al instante
      const respuesta = {
        statusCode: 200,
        success: true,
        message:
          '✅ Asunto actualizado correctamente. Las notificaciones y correos se enviarán en segundo plano.',
      };

      // 🚀 7. Procesos pesados en segundo plano
      setImmediate(async () => {
        try {
          const contrato = asesoramiento?.contrato ?? null;
          const procesos = asesoramiento?.procesosasesoria || [];
          const asesor = procesos.find((p) => p?.asesor)?.asesor || null;
          const clientes = procesos
            .map((p) => p?.cliente)
            .filter((c) => c && c.email);

          if (!asesor || clientes.length === 0) {
            console.warn(
              '⚠️ No se enviaron notificaciones: faltan datos de asesor o clientes.',
            );
            return;
          }

          // 📩 Notificación interna (no bloqueante)
          this.notificacionesService
            .notificarClientesDeAsesoramiento(
              asesoramiento.id,
              contrato?.id ?? null,
              `El asesor ${asesor.nombre} ha actualizado el asunto "${nuevoTitulo}". Revisa los documentos recientes en la plataforma.`,
              'avance_actualizado',
              { idAsesorEmisor: asesor.id },
            )
            .then(() =>
              console.log('✅ Notificaciones internas enviadas correctamente'),
            )
            .catch((err) =>
              console.error('⚠️ Error enviando notificaciones:', err.message),
            );

          // 📧 Correos (en paralelo)
          await Promise.allSettled(
            clientes.map((cliente) =>
              this.mailService
                .sendAvanceClienteEmail(
                  cliente.email,
                  asesor.nombre || 'Tu asesor',
                  asesoramiento.profesion_asesoria || 'Tu asesoría',
                )
                .then(() =>
                  console.log(
                    `📬 Correo enviado correctamente a ${cliente.email}`,
                  ),
                )
                .catch((err) =>
                  console.error(
                    `❌ Error enviando correo a ${cliente.email}:`,
                    err.message,
                  ),
                ),
            ),
          );
        } catch (err) {
          console.error(
            '⚠️ Error en proceso asíncrono de notificaciones:',
            err,
          );
        }
      });

      // 🟢 8. Retornar respuesta rápida al front
      return respuesta;
    } catch (error) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();
      console.error('❌ Error en updateAsunto:', error);
      throw new InternalServerErrorException(
        error.message || 'Error interno al actualizar el asunto',
      );
    } finally {
      await queryRunner.release();
    }
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
