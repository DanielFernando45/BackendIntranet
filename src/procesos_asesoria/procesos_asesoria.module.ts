import { Module } from '@nestjs/common';
import { ProcesosAsesoriaService } from './procesos_asesoria.service';
import { ProcesosAsesoriaController } from './procesos_asesoria.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcesosAsesoria } from './entities/procesos_asesoria.entity';

@Module({
  imports:[TypeOrmModule.forFeature([ProcesosAsesoria])],
  controllers: [ProcesosAsesoriaController],
  providers: [ProcesosAsesoriaService],
  exports:[ProcesosAsesoriaService]
})
export class ProcesosAsesoriaModule {}
