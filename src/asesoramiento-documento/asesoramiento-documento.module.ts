import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsesoramientoDocumento } from './entity/asesoramiento-documento.entity';
import { AsesoramientoDocumentoService } from './asesoramiento-documento.service';
import { AsesoramientoDocumentoController } from './asesoramiento-documento.controller';
import { BackblazeModule } from 'src/backblaze/backblaze.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([AsesoramientoDocumento]),
    BackblazeModule,
  ],
  controllers: [AsesoramientoDocumentoController],
  providers: [AsesoramientoDocumentoService],
})
export class AsesoramientoDocumentoModule {}
