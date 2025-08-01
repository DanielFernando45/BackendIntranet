import { forwardRef, Module } from '@nestjs/common';
import { AsesoramientoService } from './asesoramiento.service';
import { AsesoramientoController } from './asesoramiento.controller';
import { ProcesosAsesoriaModule } from '../procesos_asesoria/procesos_asesoria.module';
import { ClienteModule } from 'src/cliente/cliente.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asesoramiento } from './entities/asesoramiento.entity';
import { TipoContrato } from 'src/common/entidades/tipoContrato.entity';
import { TipoTrabajo } from 'src/common/entidades/tipoTrabajo.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Asesoramiento,TipoContrato,TipoTrabajo]),ProcesosAsesoriaModule,forwardRef(() =>ClienteModule)],
  controllers: [AsesoramientoController],
  providers: [AsesoramientoService],
  exports:[AsesoramientoService]
})
export class AsesoramientoModule {}
