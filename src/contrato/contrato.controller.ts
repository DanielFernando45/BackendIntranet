import { Controller, Get, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { ContratoService } from './contrato.service';

@Controller('contrato')
export class ContratoController {
  constructor(private readonly contratoService: ContratoService) { }

  @Get('fechasContratoById/:idContrato')
  obtenerContratoByAsesoramiento(@Param('idContrato', ParseUUIDPipe) idContrato: string) {
    return this.contratoService.contratoByAsesoramiento(idContrato);
  }

  // @Put('cambiarEstado/:id')
  // cambiarEstadoContrato(@Param){
  //   return this.contratoService.
  // }
}
