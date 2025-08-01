import { Module } from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import { DocumentosController } from './documentos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documento } from './entities/documento.entity';
import { BackblazeModule } from 'src/backblaze/backblaze.module';

@Module({
  imports:[TypeOrmModule.forFeature([Documento]),BackblazeModule],
  exports:[DocumentosService],
  controllers: [DocumentosController],
  providers: [DocumentosService]
})
export class DocumentosModule {}
