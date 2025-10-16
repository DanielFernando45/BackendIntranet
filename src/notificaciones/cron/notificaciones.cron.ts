import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificacionesService } from '../notificacion.service';
import { LessThan } from 'typeorm';

@Injectable()
export class NotificacionesCron {
  private readonly logger = new Logger(NotificacionesCron.name);

  constructor(private readonly notiService: NotificacionesService) {}

  // 🕛 Enviar recordatorios 7 días antes del vencimiento de contrato
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async ejecutarAvisosVencimiento() {
    this.logger.log(
      '⏰ Ejecutando notificaciones de contratos próximos a vencer...',
    );
    await this.notiService.notificarVencimientoContratos();
  }

  // 🧹 Limpiar notificaciones vencidas (leídas o de contratos finalizados)
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async limpiarNotificacionesVencidas() {
    this.logger.log('🧹 Ejecutando limpieza de notificaciones...');

    // 1️⃣ Eliminar todas las notificaciones cuyo vence_en ya pasó
    const ahora = new Date();
    const eliminadasVencidas = await this.notiService.notiRepo.delete({
      vence_en: LessThan(ahora),
    });

    // 2️⃣ Eliminar las asociadas a contratos ya vencidos
    const contratosVencidos = await this.notiService.contratoRepo.find({
      where: { fecha_fin: LessThan(ahora) },
    });

    if (contratosVencidos.length > 0) {
      const idsContrato = contratosVencidos.map((c) => c.id);
      const eliminadasPorContrato = await this.notiService.notiRepo
        .createQueryBuilder()
        .delete()
        .where('id_contrato IN (:...ids)', { ids: idsContrato })
        .execute();

      this.logger.log(
        `🗑️ Notificaciones eliminadas por vencimiento de contrato: ${eliminadasPorContrato.affected}`,
      );
    }

    this.logger.log(
      `✅ Limpieza completada. Notificaciones vencidas eliminadas: ${eliminadasVencidas.affected}`,
    );
  }
}
