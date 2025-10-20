import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule'; // 👈 necesario para los cron
import { Notificacion } from './entities/notificacion.entity';
import { Contrato } from 'src/contrato/entities/contrato.entity';
import { NotificacionesController } from './notificacion.controller';
import { NotificacionesService } from './notificacion.service';
import { NotificacionesGateway } from './sockets/notificaciones.gateway';
import { NotificacionesCron } from './cron/notificaciones.cron'; // 👈 cron job

@Module({
  imports: [
    TypeOrmModule.forFeature([Notificacion, Contrato]),
    ScheduleModule.forRoot(), // 👈 habilita @Cron y @Interval
  ],
  controllers: [NotificacionesController], // 👈 registra tu controlador
  providers: [
    NotificacionesService,
    NotificacionesGateway,
    NotificacionesCron, // 👈 registra el cron job
  ],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}
