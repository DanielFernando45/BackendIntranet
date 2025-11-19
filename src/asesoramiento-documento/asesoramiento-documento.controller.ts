import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UploadedFile,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AsesoramientoDocumentoService } from './asesoramiento-documento.service';
import { CreateAsesoramientoDocumentoDto } from './dto/create-asesoramiento-documento.dto';
import { UpdateAsesoramientoDocumentoDto } from './dto/update-asesoramiento-documento.dto';

@Controller('asesoramiento-documentos')
export class AsesoramientoDocumentoController {
  constructor(private readonly service: AsesoramientoDocumentoService) {}

  @Post('crear/:asesoramientoId')
  @UseInterceptors(FilesInterceptor('files'))
  create(
    @Param('asesoramientoId') asesoramientoId: string,
    @Body() dto: CreateAsesoramientoDocumentoDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.service.create(+asesoramientoId, dto, files);
  }

  @Patch('editar/:id')
  @UseInterceptors(FilesInterceptor('files'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAsesoramientoDocumentoDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.service.update(+id, dto, files);
  }

  @Get('listar/:asesoramientoId')
  findAll(@Param('asesoramientoId') id: string) {
    return this.service.findAll(+id);
  }

  @Get('obtener/:id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Delete('eliminar/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
