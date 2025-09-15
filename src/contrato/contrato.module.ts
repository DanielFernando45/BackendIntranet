import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContratoService } from './contrato.service';
import { ContratoController } from './contrato.controller';
import { Contrato } from './entities/contrato.entity';
import { Asesoramiento } from '../asesoramiento/entities/asesoramiento.entity';
import { TipoTrabajo } from '../common/entidades/tipoTrabajo.entity';
import { TipoPago } from '../common/entidades/tipoPago.entity';
import { Categoria } from '../categoria/entities/categoria.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Contrato,
      Asesoramiento,
      TipoTrabajo,
      TipoPago,
      Categoria,
    ]),
  ],
  controllers: [ContratoController],
  providers: [ContratoService],
  exports: [ContratoService],
})
export class ContratoModule {}
