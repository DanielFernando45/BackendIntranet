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
} from '@nestjs/common';
import { ContratoService } from './contrato.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
@Controller('contrato')
export class ContratoController {
  constructor(private readonly contratoService: ContratoService) {}

  @Get('fechasContratoById/:idContrato')
  obtenerContratoByAsesoramiento(
    @Param('idContrato', ParseUUIDPipe) idContrato: string,
  ) {
    return this.contratoService.contratoByAsesoramiento(idContrato);
  }

  @Post(':idAsesoramiento')
  async createContrato(
    @Param('idAsesoramiento') idAsesoramiento: string,
    @Body() dto: CreateContratoDto,
  ) {
    return this.contratoService.createContrato(Number(idAsesoramiento), dto);
  }

  @Put(':idContrato')
  async updateContrato(
    @Param('idContrato', ParseUUIDPipe) idContrato: string,
    @Body() dto: UpdateContratoDto,
  ) {
    return this.contratoService.updateContrato(idContrato, dto);
  }

  @Delete(':idContrato')
  async deleteContrato(
    @Param('idContrato', ParseUUIDPipe) idContrato: string,
  ) {
    return this.contratoService.deleteContrato(idContrato);
  }
  // @Put('cambiarEstado/:id')
  // cambiarEstadoContrato(@Param){
  //   return this.contratoService.
  // }
}
