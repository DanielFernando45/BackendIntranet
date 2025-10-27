import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { DocumentosService } from './documentos.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { Subido } from './entities/documento.entity';

@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post()
  create(@Body() createDocumentoDto: CreateDocumentoDto) {
    return 'Nice';
  }

  @Get('download/:pathFile')
  findFile(@Res() res: Response, @Param('pathFile') pathName: string) {
    const path = this.documentosService.getFile(pathName);
    return res.sendFile(path);
  }

  @Get('estudiante/list/:id')
  async listDocumentsCliente(@Param('id', ParseIntPipe) id: number) {
    const subido_por = Subido.ESTUDIANTE;
    return this.documentosService.findDocuments(id, subido_por);
  }

  @Get('asesor/list/:id')
  async listDocumentsAsesor(@Param('id', ParseIntPipe) id: number) {
    const subido_por = Subido.ASESOR;
    return this.documentosService.findDocuments(id, subido_por);
  }
}
