import { Module } from '@nestjs/common';
import { SoportesService } from './soportes.service';
import { SoportesController } from './soportes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Soporte } from './entities/soporte.entity';
import { ClienteModule } from 'src/cliente/cliente.module';

@Module({
  imports:[TypeOrmModule.forFeature([Soporte]),ClienteModule],
  controllers: [SoportesController],
  providers: [SoportesService],
})

export class SoportesModule {}