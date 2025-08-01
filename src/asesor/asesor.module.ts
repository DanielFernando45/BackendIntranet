import { Module } from '@nestjs/common';
import { AsesorService } from './asesor.service';
import { AsesorController } from './asesor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asesor } from './asesor.entity';
import { Usuario } from '../usuario/usuario.entity';
import { AreaAsesor } from 'src/common/entidades/areaAsesor.entity';
import { GradoAcademico } from 'src/common/entidades/gradoAcademico.entity';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { AsesoramientoModule } from 'src/asesoramiento/asesoramiento.module';
import { ProcesosAsesoriaModule } from 'src/procesos_asesoria/procesos_asesoria.module';

@Module({
  imports:[TypeOrmModule.forFeature([Asesor,Usuario,AreaAsesor,GradoAcademico]),UsuarioModule,AsesoramientoModule,ProcesosAsesoriaModule],
  providers: [AsesorService],
  controllers: [AsesorController],
  exports:[AsesorService]
})
export class AsesorModule {}
