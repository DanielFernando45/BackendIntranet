import { Module } from '@nestjs/common';
import { SupervisorService } from './supervisor.service';
import { SupervisorController } from './supervisor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supervisor } from './entities/supervisor.entity';
import { Area } from 'src/area/entities/area.entity';
import { AreaModule } from 'src/area/area.module';
import { UsuarioService } from 'src/usuario/usuario.service';
import { AreaService } from 'src/area/area.service';
import { UsuarioModule } from 'src/usuario/usuario.module';

@Module({
  imports: [TypeOrmModule.forFeature([Supervisor, Area]), AreaModule, UsuarioModule],
  controllers: [SupervisorController],
  providers: [SupervisorService],
  exports: [SupervisorService]
})
export class SupervisorModule {}
