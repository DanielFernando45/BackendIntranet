import { Module } from '@nestjs/common';
import { InduccionesService } from './inducciones.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inducciones } from './entity/inducciones';
import { InduccionesController } from './induccion.controller';
import { BackblazeModule } from 'src/backblaze/backblaze.module';
@Module({
    exports: [InduccionesService],
    imports: [TypeOrmModule.forFeature([Inducciones]), BackblazeModule],
    providers: [InduccionesService],
    controllers: [InduccionesController]
})
export class InduccionesModule { }
