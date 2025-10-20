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
  UsePipes,
  ValidationPipe,
  Req,
  UnauthorizedException,
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

@Controller('asuntos')
export class AsuntosController {
  constructor(private readonly asuntosService: AsuntosService) {}

  @UseGuards(JwtAuthGuard)
  @Post('addWithDocument/:id_asesoramiento')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      fileFilter,
      limits: {
        fileSize: 1024 * 1024 * 30, // 30MB
      },
    }),
  )
  async addAsuntoinAsesoramiento(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createAsuntoDto: CreateAsuntoDto,
    @Param('id_asesoramiento', ParseIntPipe) id_asesoramiento: number,
    @Req() req,
  ) {
    // 1️⃣ Validar que haya archivos
    if (!files || files.length === 0) {
      throw new BadRequestException('No se ha enviado ningún archivo.');
    }

    // 2️⃣ Verificar que el usuario autenticado esté presente
    if (!req.user) {
      throw new UnauthorizedException('Usuario no autenticado.');
    }

    // 3️⃣ Log de depuración (ver qué llega en el req.user)
    console.log('🧠 Usuario autenticado en addWithDocument:', req.user);

    try {
      // 4️⃣ Enviar todo al servicio
      const response = await this.asuntosService.create(
        createAsuntoDto,
        files,
        id_asesoramiento,
        req.user,
      );

      return {
        statusCode: 201,
        message: 'Asunto creado correctamente con archivos adjuntos',
        data: response,
      };
    } catch (err) {
      console.error('❌ Error al crear asunto:', err);

      // 5️⃣ Manejo más claro del error
      throw new InternalServerErrorException({
        message: 'Error al agregar los archivos',
        details: err.message,
      });
    }
  }

  @Patch('en_proceso/:id')
  @UsePipes(new ValidationPipe({ transform: false })) // 🚨 transform desactivado SOLO aquí
  async EstateToProcess(
    @Param('id') id: string,
    @Body() body: ChangeToProcess,
  ) {
    return this.asuntosService.EstateToProcess(id, body);
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
      console.log('Body recibido:', cambioAsunto);
      console.log(
        'Files recibidos:',
        files?.map((f) => f.originalname),
      );
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

  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      fileFilter,
      limits: { fileSize: 1024 * 1025 * 30 },
    }),
  )
  async updateAsunto(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateAsuntoDto: UpdateAsuntoDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.asuntosService.updateAsunto(id, updateAsuntoDto, files);
  }

  @Patch('estudiante/:id')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      fileFilter,
      limits: { fileSize: 1024 * 1025 * 30 },
    }),
  )
  async updateAsuntoEstudiante(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateAsuntoDto: UpdateAsuntoDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.asuntosService.updateAsuntoEstudiante(
      id,
      updateAsuntoDto,
      files,
    );
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
