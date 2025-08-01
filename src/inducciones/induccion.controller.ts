import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InduccionesService } from './inducciones.service';
import { Inducciones } from './entity/inducciones';
import { CreateInduccionDto } from './dto/subir-induccion.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { BackbazeService } from 'src/backblaze/backblaze.service';
import { DIRECTORIOS } from 'src/backblaze/directorios.enum';
import { Response } from 'express';

@Controller('inducciones')
export class InduccionesController {
  constructor(private readonly induccionesService: InduccionesService) {}

  @Get('induccionesByAsesoria/:id')
  async getInduccionByAsesoria(@Param('id', ParseIntPipe) id: number) {
    return this.induccionesService.getInduccionesByAsesoria(id);
  }

  @Get('lista')
  async listFiles() {
    return this.induccionesService.list();
  }

  @Get('downloadVideo/:nombre')
  async download(@Param('nombre') nombre: string, @Res() res: Response) {
    // console.log('[Controller] Solicitando archivo:', nombre); // solo el nombre limpio

    // try {
    //   const { buffer, mimeType } =
    //     await this.induccionesService.downloadFileByName(nombre);

    //   res.setHeader('Content-Type', mimeType);
    //   res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
    //   res.setHeader('Content-Length', buffer.length);
    //   res.send(buffer);
    // } catch (error) {
    //   console.error('[Controller] Error:', error.message);
    //   res.status(404).json({ message: error.message });
    // }
    return 
  }

  @Post('')
  @UseInterceptors(FileInterceptor('video'))
  async createInduccion(
    @UploadedFile() file: Express.Multer.File,
    @Body() induccionData: CreateInduccionDto,
  ) {
    if (!file) throw new BadRequestException('No se ha enviado archivos');
    const newInduccion = await this.induccionesService.createInduccion(
      file,
      induccionData,
    );
    if (!newInduccion) {
      throw new Error('Error al crear la inducción');
    }
    return { message: 'Inducción creada exitosamente' };
  }

  @Delete(':id')
  async deleteInduccion(@Param('id', ParseIntPipe) id: number) {
    return this.induccionesService.deleteInduccion(id);
  }
}
