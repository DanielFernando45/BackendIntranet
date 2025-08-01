import { forwardRef, Module } from '@nestjs/common';
import { AsuntosService } from './asuntos.service';
import { AsuntosController } from './asuntos.controller';
import { DocumentosModule } from 'src/documentos/documentos.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asunto } from './entities/asunto.entity';
import { CommonModule } from 'src/common/common.module';
import { ProcesosAsesoriaModule } from 'src/procesos_asesoria/procesos_asesoria.module';
import { AsesorModule } from 'src/asesor/asesor.module';
import { ClienteService } from 'src/cliente/cliente.service';
import { ClienteModule } from 'src/cliente/cliente.module';
import { BackblazeModule } from 'src/backblaze/backblaze.module';

@Module({
  imports:[TypeOrmModule.forFeature([Asunto]),DocumentosModule,AsesorModule,ClienteModule,ProcesosAsesoriaModule,forwardRef(() =>AsuntosModule),BackblazeModule],
  controllers: [AsuntosController],
  providers: [AsuntosService],
  exports:[AsuntosService]
})
export class AsuntosModule {}
