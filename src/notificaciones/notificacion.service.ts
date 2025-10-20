import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Notificacion } from './entities/notificacion.entity';
import { Contrato } from 'src/contrato/entities/contrato.entity';
import { NotificacionesGateway } from './sockets/notificaciones.gateway';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacion)
    public readonly notiRepo: Repository<Notificacion>,
    @InjectRepository(Contrato)
    public readonly contratoRepo: Repository<Contrato>,
    private readonly gateway: NotificacionesGateway,
  ) {}

  // 📢 Notificar a CLIENTE (receptor). Emisor opcional (asesor/cliente/sistema)
  async notificarCliente(
    idClienteReceptor: number,
    idContrato: string,
    mensaje: string,
    tipo: string,
    opts?: { idClienteEmisor?: number; idAsesorEmisor?: number },
  ) {
    const contrato = await this.contratoRepo.findOneBy({ id: idContrato });

    const noti = new Notificacion();
    if (opts?.idClienteEmisor)
      noti.clienteEmisor = { id: opts.idClienteEmisor } as any;
    if (opts?.idAsesorEmisor)
      noti.asesorEmisor = { id: opts.idAsesorEmisor } as any;
    noti.clienteReceptor = { id: idClienteReceptor } as any;
    noti.contrato = contrato ?? null;
    noti.mensaje = mensaje;
    noti.tipo = tipo;
    noti.vence_en = contrato?.fecha_fin ?? null;

    const saved = await this.notiRepo.save(noti);

    await this.gateway.emitirNotificacion({
      idUsuario: idClienteReceptor,
      mensaje,
      tipo,
      audiencia: 'cliente',
    });

    return saved;
  }

  // 📩 Notificar a ASESOR (receptor). Emisor opcional
  async notificarAsesor(
    idAsesorReceptor: number,
    idContrato: string,
    mensaje: string,
    tipo: string,
    opts?: { idClienteEmisor?: number; idAsesorEmisor?: number },
  ) {
    const contrato = await this.contratoRepo.findOneBy({ id: idContrato });

    const noti = new Notificacion();
    if (opts?.idClienteEmisor)
      noti.clienteEmisor = { id: opts.idClienteEmisor } as any;
    if (opts?.idAsesorEmisor)
      noti.asesorEmisor = { id: opts.idAsesorEmisor } as any;
    noti.asesorReceptor = { id: idAsesorReceptor } as any;
    noti.contrato = contrato ?? null;
    noti.mensaje = mensaje;
    noti.tipo = tipo;
    noti.vence_en = contrato?.fecha_fin ?? null;

    const saved = await this.notiRepo.save(noti);

    await this.gateway.emitirNotificacion({
      idUsuario: idAsesorReceptor,
      mensaje,
      tipo,
      audiencia: 'asesor',
    });

    return saved;
  }

  // 🧩 Crear UNA sola notificación con emisores y receptores flexibles
  async crearNotificacionUnica({
    idClienteReceptor,
    idAsesorReceptor,
    idClienteEmisor,
    idAsesorEmisor,
    idContrato,
    mensaje,
    tipo,
  }: {
    idClienteReceptor?: number;
    idAsesorReceptor?: number;
    idClienteEmisor?: number;
    idAsesorEmisor?: number;
    idContrato: string;
    mensaje: string;
    tipo: string;
  }) {
    const contrato = await this.contratoRepo.findOneBy({ id: idContrato });

    const noti = new Notificacion();
    if (idClienteEmisor) noti.clienteEmisor = { id: idClienteEmisor } as any;
    if (idAsesorEmisor) noti.asesorEmisor = { id: idAsesorEmisor } as any;
    if (idClienteReceptor)
      noti.clienteReceptor = { id: idClienteReceptor } as any;
    if (idAsesorReceptor) noti.asesorReceptor = { id: idAsesorReceptor } as any;
    noti.contrato = contrato ?? null;
    noti.mensaje = mensaje;
    noti.tipo = tipo;
    noti.vence_en = contrato?.fecha_fin ?? null;

    const saved = await this.notiRepo.save(noti);

    // 🔔 Emitir a cada usuario según corresponda
    if (idClienteReceptor) {
      await this.gateway.emitirNotificacion({
        idUsuario: idClienteReceptor,
        mensaje,
        tipo,
        audiencia: 'cliente',
      });
    }
    if (idAsesorReceptor) {
      await this.gateway.emitirNotificacion({
        idUsuario: idAsesorReceptor,
        mensaje,
        tipo,
        audiencia: 'asesor',
      });
    }

    return saved;
  }

  // 👥 Notificar a TODOS los clientes asociados a un asesoramiento
  async notificarClientesDeAsesoramiento(
    idAsesoramiento: number,
    idContrato: string,
    mensaje: string,
    tipo: string,
    opts?: { idAsesorEmisor?: number },
  ) {
    // 🧭 Buscar contrato con su asesoramiento y clientes
    const contrato = await this.contratoRepo.findOne({
      where: { id: idContrato },
      relations: ['asesoramiento', 'asesoramiento.clientes'],
    });

    // Validar existencia
    const asesoramiento = contrato?.asesoramiento;
    if (!asesoramiento) return;

    // ✅ Tomar clientes únicos (por si se duplica en la relación)
    const clientesUnicos = new Map<number, boolean>();

    // 🧩 Recorrer clientes del asesoramiento (evita duplicados)
    for (const cliente of asesoramiento.clientes) {
      if (!cliente?.id || clientesUnicos.has(cliente.id)) continue;
      clientesUnicos.set(cliente.id, true);

      await this.notificarCliente(cliente.id, idContrato, mensaje, tipo, {
        idAsesorEmisor: opts?.idAsesorEmisor,
      });
    }
  }
  // 📬 Obtener todas las notificaciones RECIBIDAS por un CLIENTE
  async obtenerNotificacionesEnviadasPorCliente(idCliente: number) {
    return await this.notiRepo.find({
      where: { clienteReceptor: { id: idCliente } },
      relations: [
        'clienteEmisor',
        'asesorEmisor',
        'clienteReceptor',
        'asesorReceptor',
        'contrato',
      ],
      order: { fecha_creacion: 'DESC' },
    });
  }

  // 📬 Obtener todas las notificaciones RECIBIDAS por un ASESOR
  async obtenerNotificacionesEnviadasPorAsesor(idAsesor: number) {
    return await this.notiRepo.find({
      where: { asesorReceptor: { id: idAsesor } },
      relations: [
        'clienteEmisor',
        'asesorEmisor',
        'clienteReceptor',
        'asesorReceptor',
        'contrato',
      ],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async marcarComoLeida(idNotificacion: number): Promise<Notificacion> {
    const noti = await this.notiRepo.findOne({ where: { id: idNotificacion } });
    if (!noti) {
      throw new Error(`Notificación con ID ${idNotificacion} no encontrada`);
    }

    noti.leida = true;
    return await this.notiRepo.save(noti);
  }

  // 🕒 Aviso automático 7 días antes del vencimiento
  async notificarVencimientoContratos() {
    const hoy = new Date();
    const enSieteDias = new Date();
    enSieteDias.setDate(hoy.getDate() + 7);

    const contratos = await this.contratoRepo.find({
      where: { fecha_fin: LessThan(enSieteDias) },
      relations: [
        'asesoramiento',
        'asesoramiento.clientes',
        'asesoramiento.asesores',
      ],
    });

    for (const contrato of contratos) {
      const asesoramiento = contrato.asesoramiento;
      if (!asesoramiento) continue;

      // 🔔 Notificar a todos los clientes del asesoramiento
      if (asesoramiento.clientes?.length) {
        for (const cliente of asesoramiento.clientes) {
          await this.notificarCliente(
            cliente.id,
            contrato.id,
            `Tu contrato "${contrato.servicio}" está próximo a vencer.`,
            'vencimiento',
          );
        }
      }

      // 🔔 Notificar al asesor
      const idAsesor = asesoramiento.asesores?.[0]?.id;
      if (idAsesor) {
        await this.notificarAsesor(
          idAsesor,
          contrato.id,
          `El contrato con tus clientes está próximo a vencer.`,
          'vencimiento',
        );
      }
    }
  }
}
