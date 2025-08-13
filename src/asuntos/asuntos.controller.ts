import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
  UploadedFiles,
  ParseIntPipe,
  Inject,
  UseGuards,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { AsuntosService } from './asuntos.service';
import { CreateAsuntoDto } from './dto/create-asunto.dto';
import { UpdateAsuntoDto } from './dto/update-asunto.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { fileFilter } from 'src/documentos/helpers/fileFilter.helper';
import { fileNamer } from 'src/documentos/helpers/fileNamer.helper';
import { diskStorage } from 'multer';
import { ChangeToProcess } from './dto/change-to-process.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { IsDelegadoGuard } from 'src/common/guards/delegado.guard';
import { updateClienteDto } from 'src/cliente/dto/update-cliente.dto';

const HOST_API = 'http://localhost:3001';

@Controller('asuntos')
export class AsuntosController {
  constructor(private readonly asuntosService: AsuntosService) { }

  @Post('addWithDocument/:id_asesoramiento')
  @UseGuards(JwtAuthGuard, IsDelegadoGuard)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      fileFilter,
      limits: {
        fileSize: 1024 * 1025 * 30,
      },
    }),
  )
  async addAsuntoinAsesoramiento(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createAsuntoDto: CreateAsuntoDto,
    @Param('id_asesoramiento', ParseIntPipe) id_asesoramiento: number,
  ) {
    if (!files || files.length === 0)
      throw new BadRequestException('No se ha enviado archivos');
    try {
      //   const listaNombresyUrl=files.map((item)=>{
      //   return {nombreDocumento:item.originalname,secureUrl:`${HOST_API}/files/product/${item.filename}`}
      // })
      // console.log(listaNombresyUrl)

      const response = await this.asuntosService.create(
        createAsuntoDto,
        files,
        id_asesoramiento,
      );
      return response;
    } catch (err) {
      throw new InternalServerErrorException('Error al agregar los archivos');
    }
  }

  @Patch('en_proceso/:id')
  async toProcess(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: ChangeToProcess,
  ) {
    return await this.asuntosService.EstateToProcess(id, body);
  }

  @Patch('finished/:id')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      fileFilter,
    }),
  )
  async finishAsunto(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() cambioAsunto: UpdateAsuntoDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0)
      throw new BadRequestException('No se ha enviado archivos');
    try {
      // const listaNombresyUrl=files.map((item)=>{
      //   return {nombreDocumento:item.originalname,secureUrl:`${HOST_API}/files/product/${item.filename}`}
      // })
      const newTitulo = cambioAsunto.titulo;
      if (!newTitulo) throw new BadRequestException('Falta agregar el titulo');
      return await this.asuntosService.finishAsunt(id, newTitulo, files);
    } catch (err) {
      return new InternalServerErrorException(
        `Error en el controlador, ${err.message}`,
      );
    }
  }

  @Get('terminados/:id')
  async getTerminados(@Param('id', ParseIntPipe) id: number) {
    return await this.asuntosService.getFinished(id);
  }

  // Obtener asusntos por id asesoramiento
  @Get('all/:id')
  async getAll(@Param('id', ParseIntPipe) id: number) {
    return await this.asuntosService.getAll(id);
  }

  @Put(':id')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      fileFilter,
      limits: {
        fileSize: 1024 * 1025 * 30,
      },
    }),
  )
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAsuntoDto: UpdateAsuntoDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.asuntosService.updateAsunto(id, updateAsuntoDto, files);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.asuntosService.eliminarAsunto(id);
  }

  @Get('fechasEstimadas/:id')
  fechasEstimadas(@Param('id', ParseIntPipe) id: number) {
    return this.asuntosService.listarFechasEntregas(id);
  }

  // Obtner asunto por id
  @Get('obtenerAsunto/:id')
  asuntoPorId(@Param('id', ParseUUIDPipe) id: string) {
    return this.asuntosService.getAsuntoById(id);
  }

  // Obtner asunto por id
  @Get('obtenerAsuntoTerminadosAsesor/:id')
  asuntoPorAsesor(@Param('id', ParseUUIDPipe) id: string) {
    return this.asuntosService.getAsuntosTerminadosAsesor(id);
  }
  
  @Put('editarFechaAsuntoPendiente/:id')
  editarFechaAsunto(@Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    return this.asuntosService.editarFechaAsuntoPendiente(id, body);
  }
}
