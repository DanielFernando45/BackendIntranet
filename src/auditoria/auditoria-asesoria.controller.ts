import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AuditoriaAsesoriaService } from './auditoria-asesoria.service';
import { AuditoriaAsesoria } from './entities/auditoria-asesoria.entity';

@Controller('auditoria')
export class AuditoriaAsesoriaController {
  constructor(private readonly servicio: AuditoriaAsesoriaService) {}

  @Post()
  async registrar(@Body() data: Partial<AuditoriaAsesoria>) {
    return this.servicio.registrarEvento(data);
  }

  @Get('filtrar')
  async obtenerAuditorias(
    @Query('idArea') idArea: string,
    @Query('idAsesor') idAsesor: number,
    @Query('fecha') fecha: string,
  ) {
    const fechaFiltro = new Date(fecha);
    return this.servicio.obtenerAuditoriasPorFiltros(
      idArea,
      idAsesor,
      fechaFiltro,
    );
  }
}
