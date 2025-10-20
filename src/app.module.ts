import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsuarioModule } from './usuario/usuario.module';
import { AdminModule } from './admin/admin.module';
import { ClienteModule } from './cliente/cliente.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AsesorModule } from './asesor/asesor.module';
import { Entities } from './entities';
import { MailModule } from './mail/mail.module';
import { Throttle, ThrottlerModule } from '@nestjs/throttler';
import { AsesoramientoModule } from './asesoramiento/asesoramiento.module';
import { ProcesosAsesoriaModule } from './procesos_asesoria/procesos_asesoria.module';
import { CommonModule } from './common/common.module';
import { AsuntosModule } from './asuntos/asuntos.module';
import { DocumentosModule } from './documentos/documentos.module';
import { ReunionesModule } from './reuniones/reuniones.module';
import { RecursosModule } from './recursos/recursos.module';
import { PagosModule } from './pagos/pagos.module';
import { SoportesModule } from './soportes/soportes.module';
import { BackblazeModule } from './backblaze/backblaze.module';
import { SeminariosModule } from './seminarios/seminarios.module';
import { InduccionesModule } from './inducciones/inducciones.module';
import { ContratoModule } from './contrato/contrato.module';
import { CategoriaModule } from './categoria/categoria.module';
import { SupervisorModule } from './supervisor/supervisor.module';
import { AreaModule } from './area/area.module';
import { RolModule } from './rol/rol.module';
import { NotificacionesModule } from './notificaciones/notificacion.module';
import { AuditoriaModule } from './auditoria/auditoria.module';

let puerto: number;

if (process.env.DB_PORT) {
  puerto = parseInt(process.env.DB_PORT);
} else {
  puerto = 3306;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT') || 3306,
        username: configService.get<string>('DB_USER') || 'root',
        password: configService.get<string>('DB_PASSWORD') || '12345',
        database: configService.get<string>('DB_NAME') || 'Alejandria',
        entities: Entities, // Aquí debes pasar todas tus entidades
        synchronize: false, // Cambiar a `false` en producción
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsuarioModule,
    AdminModule,
    ClienteModule,
    AsesorModule,
    MailModule,
    AsesoramientoModule,
    ProcesosAsesoriaModule,
    CommonModule,
    AsuntosModule,
    DocumentosModule,
    ReunionesModule,
    RecursosModule,
    PagosModule,
    SoportesModule,
    BackblazeModule,
    SeminariosModule,
    InduccionesModule,
    CategoriaModule,
    ContratoModule,
    SupervisorModule,
    AreaModule,
    RolModule,
    NotificacionesModule,
    AuditoriaModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
