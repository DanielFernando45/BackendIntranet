import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateReunionDto } from './dto/create-reunion.dto';
import { UpdateReunioneDto } from './dto/update-reunione.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Estado_reunion, Reunion } from './entities/reunion.entity';
import { Between, DataSource, Repository } from 'typeorm';
import { ZoomMeetingService } from './zoom.meeting.service';
import { DateTime } from 'luxon';
import { AsesorService } from 'src/asesor/asesor.service';
import { ZoomAuthService } from './zoom.auth.service';
import axios from 'axios';
import { ClienteService } from 'src/cliente/cliente.service';
import { UserRole } from 'src/usuario/usuario.entity';
import { ProcesosAsesoriaService } from 'src/procesos_asesoria/procesos_asesoria.service';
import { ProcesosAsesoria } from 'src/procesos_asesoria/entities/procesos_asesoria.entity';
import { GetReunionFilterDto } from './dto/get-reunion-filter.dto';

@Injectable()
export class ReunionesService {
  constructor(
    private readonly zoomMeetingService: ZoomMeetingService,
    private readonly asesorService: AsesorService,
    private readonly zoomAuthService: ZoomAuthService,
    private clienteService: ClienteService,

    @InjectDataSource()
    private readonly dataSource: DataSource,

    @InjectRepository(Reunion)
    private reunionRepo: Repository<Reunion>,
  ) {}

  async addReunion(createReunionDto: CreateReunionDto) {
    if (
      !createReunionDto.fecha_reunion ||
      isNaN(new Date(createReunionDto.fecha_reunion).getTime())
    ) {
      throw new BadRequestException('Fecha de reunión no válida');
    }
    const credenciales = await this.asesorService.getCredentialsBySector(
      createReunionDto.id_asesor,
    );

    const token = await this.zoomAuthService.getAccessToken(
      credenciales.client_id,
      credenciales.client_secret,
      credenciales.client_account_id,
    );

    // 1. Parsear la fecha (asumiendo que viene en hora local Perú)
    const fechaReunion = new Date(createReunionDto.fecha_reunion);
  
    const horaLima = DateTime.now().setZone('America/Lima');


    // 3. Crear fecha ISO SIN conversión UTC (Zoom maneja la zona horaria)
    const fechaISO = fechaReunion.toISOString().split('.')[0];

    const zoomMeeting = await this.zoomMeetingService.createMeeting(
      credenciales.correo,
      createReunionDto.titulo,
      fechaISO,
      token,
    );

    const newReunion = this.reunionRepo.create({
      titulo: createReunionDto.titulo,
      fecha_reunion: createReunionDto.fecha_reunion,
      enlace_zoom: zoomMeeting.join_url,
      zoom_password: zoomMeeting.password,
      meetingId: String(zoomMeeting.id),
      zoomUuid: zoomMeeting.uuid,
      estado: Estado_reunion.ESPERA,
      fecha_creacion: horaLima.toJSDate(),
      asesoramiento: { id: createReunionDto.id_asesoramiento },
    });

    await this.reunionRepo.save(newReunion);

    return 'Se agrego la reunion satisfactoriamente';
  }
  async deleteReunion(id: number, id_asesor: number) {
    // Obtener credenciales del asesor
    const credenciales =
      await this.asesorService.getCredentialsBySector(id_asesor);

    // Buscar reunión en la BD
    const reunion = await this.reunionRepo.findOne({
      where: { id },
      select: ['meetingId'],
    });

    if (!reunion) {
      throw new NotFoundException('No se encontró la reunión');
    }

    // Si no hay meetingId, solo borrar de la BD
    if (!reunion.meetingId) {
      console.warn(
        `⚠️ Reunión ${id} no tiene meetingId asociado. Se eliminará solo de la BD.`,
      );
      await this.reunionRepo.delete({ id });
      return 'Reunión eliminada localmente (sin Zoom)';
    }

    // Obtener token de Zoom
    const token = await this.zoomAuthService.getAccessToken(
      credenciales.client_id,
      credenciales.client_secret,
      credenciales.client_account_id,
    );

    try {
      // Intentar eliminar reunión en Zoom
      await axios.delete(
        `https://api.zoom.us/v2/meetings/${reunion.meetingId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 7000,
        },
      );
    } catch (err) {
      console.error(
        '❌ Error al eliminar reunión desde Zoom:',
        err.response?.data || err.message,
      );
      throw new BadRequestException(
        `No se pudo eliminar la reunión de Zoom (${reunion.meetingId}).`,
      );
    }

    // Eliminar de la BD
    const deleted = await this.reunionRepo.delete({ id });
    if (deleted.affected === 0) {
      throw new NotFoundException(
        'No se eliminó ningún registro en la base de datos',
      );
    }

    return '✅ Reunión eliminada correctamente';
  }

  async handleRecordingCompleted(data: any) {
    console.log('🎥 Grabación completada:', JSON.stringify(data, null, 2));
    const meetingId = data.payload.object.id;
    const files = data.payload.object.recording_files;

    const videoFile = files.find((f) => f.file_type === 'MP4');
    const playUrl = videoFile?.play_url;

    const password = data.payload.object.password;

    if (!playUrl) return;

    await this.reunionRepo.update(
      { meetingId },
      {
        enlace_video: playUrl,
        estado: Estado_reunion.TERMINADO,
        video_password: password,
      },
    );
  }

  async listEspera(id: number) {
    const enEspera = await this.reunionRepo.find({
      where: { asesoramiento: { id }, estado: Estado_reunion.ESPERA },
      select: [
        'meetingId',
        'titulo',
        'fecha_reunion',
        'enlace_zoom',
        'zoom_password',
      ],
    });
    return enEspera.length > 0 ? enEspera : [];
  }

  async listTerminados(id: number) {
    const terminados = await this.reunionRepo.find({
      where: { asesoramiento: { id }, estado: Estado_reunion.TERMINADO },
      select: [
        'meetingId',
        'titulo',
        'fecha_reunion',
        'enlace_video',
        'video_password',
      ],
    });

    return terminados.length > 0 ? terminados : [];
  }

  async listReunionesByAsesor(id: number, estado: Estado_reunion) {
    let response;
    const reunionesByAsesor = await this.reunionRepo
      .createQueryBuilder('re')
      .innerJoin('re.asesoramiento', 'as')
      .innerJoin('as.procesosasesoria', 'pr')
      .innerJoin('pr.asesor', 'asesor')
      .select([
        'DISTINCT re.id AS id',
        'as.id AS id_asesoramiento',
        're.titulo AS titulo',
        're.fecha_reunion AS fecha_reunion',
        're.enlace_zoom AS enlace',
        're.enlace_video AS enlace_video',
        're.video_password AS video_password',
        're.meetingId as meetingId',
      ])
      .where('asesor.id= :id', { id })
      .andWhere('re.estado= :estado', { estado })
      .getRawMany();

    if (estado === Estado_reunion.ESPERA) {
      response = await Promise.all(
        reunionesByAsesor.map(async (reunion) => {
          const delegado = await this.clienteService.getDelegado(
            reunion.id_asesoramiento,
          );
          return {
            id: reunion.id,
            delegado: delegado.nombre_delegado,
            asesoramiento_id: reunion.id_asesoramiento,
            titulo: reunion.titulo,
            fecha_reunion: reunion.fecha_reunion,
            enlace: reunion.enlace,
            meetingId: reunion.meetingId,
          };
        }),
      );
    }
    if (estado === Estado_reunion.TERMINADO) {
      response = await Promise.all(
        reunionesByAsesor.map(async (reunion) => {
          const delegado = await this.clienteService.getDelegado(
            reunion.id_asesoramiento,
          );
          return {
            id: reunion.id,
            delegado: delegado.nombre_delegado,
            asesoramiento_id: reunion.id_asesoramiento,
            titulo: reunion.titulo,
            fecha_reunion: reunion.fecha_reunion,
            enlace_video: reunion.enlace_video,
            password_video: reunion.video_password,
            meetingId: reunion.meetingId,
          };
        }),
      );
    }
    return response;
  }

  async getReunionesByFecha(
    id_asesoramiento: number,
    fecha: Date,
    stakeholder: UserRole,
  ) {
    const start = new Date(fecha);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const getReuniones = await this.reunionRepo.find({
      where: {
        asesoramiento: { id: id_asesoramiento },
        estado: Estado_reunion.ESPERA,
        fecha_reunion: Between(start, end),
      },
    });

    const listReunionesWithAsesor = await Promise.all(
      getReuniones.map(async (reunion) => {
        if (stakeholder === UserRole.ESTUDIANTE) {
          const asesor =
            await this.asesorService.getDatosAsesorByAsesoramiento(
              id_asesoramiento,
            );
          return {
            id_reunion: reunion.id,
            asesor_nombre: asesor.nombre,
            asesor_apellido: asesor.apellido,
            titulo: reunion.titulo,
            enlace: reunion.enlace_zoom,
            fecha: reunion.fecha_reunion,
            contraseña: reunion.zoom_password,
          };
        }

        if (stakeholder === UserRole.ASESOR) {
          const delegado =
            await this.clienteService.getDelegado(id_asesoramiento);
          return {
            id_reunion: reunion.id,
            delegado: delegado.nombre_delegado,
            titulo: reunion.titulo,
            enlace: reunion.enlace_zoom,
            fecha: reunion.fecha_reunion,
            contraseña: reunion.zoom_password,
          };
        }
      }),
    );

    return listReunionesWithAsesor;
  }

  async handleMeetingEnded(body: any) {
    const meetingId = String(body.payload.object.id);
    console.log('payload', body.payload.object);

    const reunion = await this.reunionRepo.findOne({
      where: { meetingId },
      relations: ['asesoramiento'],
    });
    const id_asesor = await this.dataSource.query(`
        select id_asesor from procesos_asesoria p where p.id_asesoramiento = ${reunion?.asesoramiento.id} limit 1;
     `);

    // Primero eliminamos en Zoom

    const credenciales = await this.asesorService.getCredentialsBySector(
      id_asesor[0].id_asesor,
    );

    if (!reunion) throw new NotFoundException('No se encontro la reunion');
    const token = await this.zoomAuthService.getAccessToken(
      credenciales.client_id,
      credenciales.client_secret,
      credenciales.client_account_id,
    );
    try {
      const response = await axios.delete(
        `https://api.zoom.us/v2/meetings/${reunion.meetingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (err) {
      throw new InternalServerErrorException(
        `No se pudo eliminar las reunion con meetingId ${reunion.meetingId}`,
      );
    }

    const deleted = await this.reunionRepo.delete({ id: reunion?.id });
    if (deleted.affected === 0)
      throw new NotFoundException('No se elimino ningun registro');

    console.log(
      `🧹 Reunión ${reunion?.id} (Zoom ID: ${meetingId}) eliminada local y remotamente.`,
    );
    return 'Se elimino correctamente';
  }

  async proximasReunionesPorFecha(id: number, filter: GetReunionFilterDto) {
    let queryBuilder = this.reunionRepo
      .createQueryBuilder('re')
      .innerJoin('re.asesoramiento', 'as')
      .innerJoin('as.procesosasesoria', 'pr')
      .innerJoin('pr.asesor', 'asesor')
      .select([
        'DISTINCT re.id AS id',
        'as.id AS id_asesoramiento',
        're.titulo AS titulo',
        're.fecha_reunion AS fecha_reunion',
        're.enlace_zoom AS enlace',
        're.enlace_video AS enlace_video',
        're.video_password AS video_password',
        're.meetingId as meetingId',
        'CONCAT(asesor.nombre, " ", asesor.apellido ) AS asesor',
      ])
      .where('asesor.id= :id', { id })
      .andWhere('re.estado = :estado', { estado: 'espera' });

    if (filter?.fecha_reunion != null) {
      console.log('hay fecha');
      queryBuilder = queryBuilder.andWhere('DATE(re.fecha_reunion) = :fecha', {
        fecha: filter.fecha_reunion,
      });
    } else {
      console.log('no hay fecha');
      // Si no viene fecha, usar fecha actual
      queryBuilder = queryBuilder.andWhere(
        'DATE(re.fecha_reunion) = CURDATE()',
      );
    }

    const result = await queryBuilder.getRawMany();
    return result;
  }
}
