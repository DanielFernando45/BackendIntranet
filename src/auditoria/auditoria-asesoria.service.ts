import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditoriaAsesoria } from './entities/auditoria-asesoria.entity';
import { BackbazeService } from 'src/backblaze/backblaze.service';

@Injectable()
export class AuditoriaAsesoriaService {
  constructor(
    private readonly backblazeService: BackbazeService,

    @InjectRepository(AuditoriaAsesoria)
    private readonly repo: Repository<AuditoriaAsesoria>,
  ) {}

  async registrarEvento(data: Partial<AuditoriaAsesoria>) {
    const evento = this.repo.create(data);
    return await this.repo.save(evento);
  }

  async obtenerAuditoriasPorCliente(
    idArea: string,
    idAsesor: number,
    idCliente: number,
  ) {
    const auditorias = await this.repo
      .createQueryBuilder('auditoria')
      .innerJoin('auditoria.procesoAsesoria', 'proceso')
      .innerJoin('proceso.asesor', 'asesor')
      .innerJoin('proceso.cliente', 'cliente')
      .innerJoin('proceso.asesoramiento', 'asesoramiento')
      .innerJoin('area', 'area', 'area.id = asesor.id_area') // ✅ JOIN con área
      // Subquery: último asunto por asesoramiento
      .leftJoin(
        (qb) =>
          qb
            .select('a.id_asesoramiento', 'id_asesoramiento')
            .addSelect('MAX(a.id)', 'id_asunto')
            .from('asunto', 'a')
            .groupBy('a.id_asesoramiento'),
        'ultimoAsunto',
        'ultimoAsunto.id_asesoramiento = asesoramiento.id',
      )
      // Join con documentos del último asunto
      .leftJoin(
        'documento',
        'documento',
        'documento.id_asunto = ultimoAsunto.id_asunto',
      )
      // Filtros
      .where('asesor.id = :idAsesor', { idAsesor })
      .andWhere('asesor.id_area = :idArea', { idArea })
      .andWhere('cliente.id = :idCliente', { idCliente }) // ✅ filtrado por cliente
      // Selección de campos
      .select([
        'cliente.nombre AS cliente',
        'asesoramiento.profesion_asesoria AS asesoría',
        'area.nombre AS area',
        'auditoria.tipo AS tipo',
        'auditoria.descripcion AS descripcion',
        'auditoria.accion AS accion',
        'auditoria.fecha_creacion AS fecha',
        'auditoria.detalle AS detalle',
        'ultimoAsunto.id_asunto AS id_asunto',
        'GROUP_CONCAT(DISTINCT documento.ruta) AS rutas',
      ])
      .groupBy('auditoria.id')
      .addGroupBy('cliente.nombre')
      .addGroupBy('asesoramiento.profesion_asesoria')
      .addGroupBy('area.nombre')
      .addGroupBy('auditoria.tipo')
      .addGroupBy('auditoria.descripcion')
      .addGroupBy('auditoria.accion')
      .addGroupBy('auditoria.fecha_creacion')
      .addGroupBy('auditoria.detalle')
      .addGroupBy('ultimoAsunto.id_asunto')
      .orderBy('auditoria.fecha_creacion', 'DESC')
      .getRawMany();

    // 🔹 Generar URLs firmadas sin duplicados
    const auditoriasConUrl = await Promise.all(
      auditorias.map(async (a: any) => {
        const rutas: string[] = a.rutas
          ? Array.from(new Set<string>(a.rutas.split(',').map((r) => r.trim())))
          : [];

        const archivos = await Promise.all(
          rutas.map(async (ruta) => {
            try {
              return await this.backblazeService.getSignedUrl(String(ruta));
            } catch (err) {
              console.error('Error generando URL firmada:', err);
              return null;
            }
          }),
        );

        return {
          ...a,
          archivos: Array.from(
            new Set(archivos.filter((x): x is string => !!x)),
          ),
        };
      }),
    );

    return auditoriasConUrl;
  }
}
