import { Module } from '@nestjs/common';
import { InduccionesService } from './inducciones.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inducciones } from './entity/inducciones';
import { InduccionesController } from './induccion.controller';
import { BackblazeModule } from 'src/backblaze/backblaze.module';
import { VideoCompressionService } from './service/video-compression.service';
@Module({
  exports: [InduccionesService],
  imports: [TypeOrmModule.forFeature([Inducciones]), BackblazeModule],
  providers: [
    InduccionesService,
    VideoCompressionService, // 👈 agregado aquí
  ],
  controllers: [InduccionesController],
})
export class InduccionesModule {}
