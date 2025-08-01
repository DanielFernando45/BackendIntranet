import { Module } from '@nestjs/common';
import { ReunionesService } from './reuniones.service';
import { ReunionesController } from './reuniones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reunion } from './entities/reunion.entity';
import { ZoomAuthService } from './zoom.auth.service';
import { ZoomMeetingService } from './zoom.meeting.service';
import { AsesorModule } from 'src/asesor/asesor.module';
import { ClienteModule } from 'src/cliente/cliente.module';

@Module({
  imports:[TypeOrmModule.forFeature([Reunion]),AsesorModule,ClienteModule],
  controllers: [ReunionesController],
  providers: [ReunionesService,ZoomAuthService,ZoomMeetingService],
  exports:[ReunionesService]
})
export class ReunionesModule {}
