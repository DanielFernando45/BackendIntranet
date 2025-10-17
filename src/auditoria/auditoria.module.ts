import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaAsesoria } from './entities/auditoria-asesoria.entity';
import { AuditoriaAsesoriaService } from './auditoria-asesoria.service';
import { AuditoriaAsesoriaController } from './auditoria-asesoria.controller';
import { BackblazeModule } from 'src/backblaze/backblaze.module';

@Module({
  imports: [TypeOrmModule.forFeature([AuditoriaAsesoria]), BackblazeModule],
  controllers: [AuditoriaAsesoriaController],
  providers: [AuditoriaAsesoriaService],
  exports: [AuditoriaAsesoriaService],
})
export class AuditoriaModule {}
