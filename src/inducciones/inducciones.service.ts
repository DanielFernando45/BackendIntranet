import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inducciones } from './entity/inducciones';
import { Repository } from 'typeorm';
import { CreateInduccionDto } from './dto/subir-induccion.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { DIRECTORIOS } from 'src/backblaze/directorios.enum';
import { BackbazeService } from 'src/backblaze/backblaze.service';

@Injectable()
export class InduccionesService {
  constructor(
    @InjectRepository(Inducciones)
    private induccionesRepo: Repository<Inducciones>,
    private readonly blackService: BackbazeService,
  ) {}

  async getInduccionesByAsesoria(id: number) {
    let inducciones = this.induccionesRepo.find({
      where: { asesoramiento: { id } },
      relations: ['asesoramiento'],
    });

    if (!inducciones) {
      throw new Error('No se encontraron inducciones para esta asesoría');
    }

    const induccionesWithURl = await Promise.all(
      (await inducciones).map(async (induccion) => {
        induccion.url = await this.blackService.getSignedUrl(induccion.url);
        return induccion;
      }),
    );
    return induccionesWithURl;
  }

  async createInduccion(
    file: Express.Multer.File,
    induccionData: CreateInduccionDto,
  ) {
    if (!file) throw new Error('No se ha enviado un archivo');

    const customName = induccionData.titulo.replace(/\s+/g, '-').toLowerCase();
    try {
      // 1. Sube el archivo y obtén la URL
      const videoUrl = await this.blackService.uploadFile(
        file,
        DIRECTORIOS.INDUCCIONES,
        customName,
      );
      console.log(videoUrl);
      // 2. Crea el registro usando la URL

      const newInduccion = this.induccionesRepo.create({
        ...induccionData,
        url: videoUrl,
        asesoramiento: { id: induccionData.asesoramiento },
      });
      return await this.induccionesRepo.save(newInduccion);
    } catch (error) {
      throw new Error('Error al crear la inducción: ' + error.message);
    }
  }

  async deleteInduccion(id: number) {
    const induccion = await this.induccionesRepo.findOne({ where: { id } });
    if (!induccion) throw new NotFoundException('Inducción no encontrada');

    const videoEliminado = await this.blackService.deleteFile(induccion.url);
    if (!videoEliminado) {
      throw new InternalServerErrorException(
        'No se pudo eliminar el archivo del almacenamiento',
      );
    }

    const deleteResult = await this.induccionesRepo.delete(id);
    if (!deleteResult.affected) {
      throw new InternalServerErrorException(
        'Error al eliminar la inducción de la base de datos',
      );
    }

    return { message: `Inducción con id: ${id} eliminada correctamente` };
  }

  async downloadFileByName(
    fileName: string,
  ): Promise<{ buffer: Buffer; mimeType: string }> {
    console.log('[Service] Descargando archivo:', fileName); // <-- ya NO tiene "inducciones/" agregado

    try {
      return await this.blackService.downloadFileByName(
        `inducciones/${fileName}`,
      );
    } catch (error) {
      console.error('[Service] Archivo no encontrado o error:', error.message);
      throw new NotFoundException(`Archivo no encontrado: ${fileName}`);
    }
  }

  async list() {
    try {
      return await this.blackService.listFiles('inducciones/');
    } catch (error) {
      console.error('[Service] Error al listar archivos:', error);
      throw new InternalServerErrorException('Error al listar archivos');
    }
  }
}
