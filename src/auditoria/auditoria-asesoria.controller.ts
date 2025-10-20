import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { AuditoriaAsesoriaService } from './auditoria-asesoria.service';
import { AuditoriaAsesoria } from './entities/auditoria-asesoria.entity';

@Controller('auditoria')
export class AuditoriaAsesoriaController {
  constructor(private readonly servicio: AuditoriaAsesoriaService) {}

  @Post()
  async registrar(@Body() data: Partial<AuditoriaAsesoria>) {
    return this.servicio.registrarEvento(data);
  }

  @Get('/:idArea/:idAsesor/:idCliente')
  async obtenerAuditoriasPorCliente(
    @Param('idArea') idArea: string,
    @Param('idAsesor', ParseIntPipe) idAsesor: number,
    @Param('idCliente', ParseIntPipe) idCliente: number,
  ) {
    return this.servicio.obtenerAuditoriasPorCliente(
      idArea,
      idAsesor,
      idCliente,
    );
  }
}
