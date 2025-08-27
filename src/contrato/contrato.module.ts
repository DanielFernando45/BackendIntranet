import { Module } from '@nestjs/common';
import { ContratoService } from './contrato.service';
import { ContratoController } from './contrato.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contrato } from './entities/contrato.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contrato])],
  controllers: [ContratoController],
  providers: [ContratoService],
  exports: [ContratoService]
})
export class ContratoModule {
  
}
