import { Module } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './entities/pago.entity';
import { Informacion_Pagos } from './entities/informacion_pagos.entity';
import { ClienteModule } from 'src/cliente/cliente.module';

@Module({
  imports:[TypeOrmModule.forFeature([Pago,Informacion_Pagos]),ClienteModule],
  controllers: [PagosController],
  providers: [PagosService],
})
export class PagosModule {}
