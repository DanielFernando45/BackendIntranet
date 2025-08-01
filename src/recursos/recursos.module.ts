import { Module } from '@nestjs/common';
import { GuiasController } from './controllers/guias.controller';
import { HerramientasController } from './controllers/herramientas.controller';
import { NoticiasController } from './controllers/noticias.controller';
import { TutorialesController } from './controllers/tutoriales.controller';
import { GuiasService } from './services/guias.service';
import { HerramientasService } from './services/herramientas.service';
import { NoticiasService } from './services/noticias.service';
import { TutorialesService } from './services/tutoriales.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guia } from './entities/guia.entity';
import { Noticia } from './entities/noticia.entity';
import { Herramienta } from './entities/herramienta.entity';
import { Tutorial } from './entities/tutorial.entity';
import { Solucion } from './entities/solucion.entity';
import { SolucionesController } from './controllers/soluciones.controller';
import { SolucionesService } from './services/soluciones.service';
import { BackblazeModule } from 'src/backblaze/backblaze.module';


@Module({
  imports:[TypeOrmModule.forFeature([Guia,Noticia,Herramienta,Tutorial,Solucion]),BackblazeModule],
  controllers: [GuiasController,HerramientasController,NoticiasController,TutorialesController,SolucionesController],
  providers: [GuiasService,HerramientasService,NoticiasService,TutorialesService,SolucionesService],
})
export class RecursosModule {}
