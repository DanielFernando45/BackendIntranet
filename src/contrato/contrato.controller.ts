import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Post,
  Body,
  Delete,
  NotFoundException,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ContratoService } from './contrato.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
@Controller('contrato')
export class ContratoController {
  constructor(private readonly contratoService: ContratoService) {}

  @Get('contratos-asignados')
  findAssignedContratos() {
    return this.contratoService.listarContratosAsignados();
  }

  @Get('contratosNoAsignados')
  findUnassignedContratos() {
    return this.contratoService.listarContratosNoAsignados();
  }

  @Get('fechasContratoById/:idContrato')
  obtenerContratoByAsesoramiento(
    @Param('idContrato', ParseUUIDPipe) idContrato: string,
  ) {
    return this.contratoService.contratoByAsesoramiento(idContrato);
  }

  @Post('crear-contrato/:idAsesoramiento')
  @UseInterceptors(FilesInterceptor('files')) // <-- Usa Multer para subir archivos
  async createContrato(
    @Param('idAsesoramiento') idAsesoramiento: string,
    @Body() dto: CreateContratoDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.contratoService.createContrato(
      Number(idAsesoramiento),
      dto,
      files,
    );
  }

  @Put('editar-contrato/:id')
  @UseInterceptors(FilesInterceptor('files'))
  async updateContrato(
    @Param('id') id: string,
    @Body() dto: UpdateContratoDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.contratoService.updateContrato(id, dto, files);
  }

  @Delete('eliminar-contrato/:idContrato')
  async deleteContrato(@Param('idContrato', ParseUUIDPipe) idContrato: string) {
    return this.contratoService.deleteContrato(idContrato);
  }
  // @Put('cambiarEstado/:id')
  // cambiarEstadoContrato(@Param){
  //   return this.contratoService.
  // }
}
