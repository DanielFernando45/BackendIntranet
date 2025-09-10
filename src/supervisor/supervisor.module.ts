import { Module } from '@nestjs/common';
import { SupervisorService } from './supervisor.service';
import { SupervisorController } from './supervisor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supervisor } from './entities/supervisor.entity';
import { Area } from 'src/area/entities/area.entity';
import { AreaModule } from 'src/area/area.module';

@Module({
  imports: [TypeOrmModule.forFeature([Supervisor, Area]), AreaModule],
  controllers: [SupervisorController],
  providers: [SupervisorService],
  exports: [SupervisorService]
})
export class SupervisorModule {}
