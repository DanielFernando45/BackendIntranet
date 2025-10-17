import { forwardRef, Module } from '@nestjs/common';
import { AsuntosService } from './asuntos.service';
import { AsuntosController } from './asuntos.controller';
import { DocumentosModule } from 'src/documentos/documentos.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asunto } from './entities/asunto.entity';
import { ProcesosAsesoriaModule } from 'src/procesos_asesoria/procesos_asesoria.module';
import { AsesorModule } from 'src/asesor/asesor.module';
import { ClienteModule } from 'src/cliente/cliente.module';
import { BackblazeModule } from 'src/backblaze/backblaze.module';
import { Documento } from 'src/documentos/entities/documento.entity';
import { NotificacionesModule } from 'src/notificaciones/notificacion.module';
import { MailModule } from 'src/mail/mail.module';
import { AuditoriaModule } from 'src/auditoria/auditoria.module';
import { AuditoriaAsesoria } from 'src/auditoria/entities/auditoria-asesoria.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asunto, Documento, AuditoriaAsesoria]),
    DocumentosModule,
    AsesorModule,
    ClienteModule,
    ProcesosAsesoriaModule,
    NotificacionesModule,
    MailModule,
    AuditoriaModule,
    forwardRef(() => AsuntosModule),
    BackblazeModule,
  ],
  controllers: [AsuntosController],
  providers: [AsuntosService],
  exports: [AsuntosService],
})
export class AsuntosModule {}
