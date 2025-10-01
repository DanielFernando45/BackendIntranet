import {
  Controller,
  Get,
  Param,
  ParseDatePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { CommonService } from './common.service';
import { UserRole } from 'src/usuario/usuario.entity';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get('listar-trabajos')
  async listTrabajos() {
    return this.commonService.listarTiposTrabajo();
  }
  //
  @Get('listar-tipoContratos')
  async listarContratos() {
    return this.commonService.listarTipoContratos();
  }

  @Get('calendario_estudiante/:id')
  listarEventosCalendarioEstudiante(@Param('id', ParseIntPipe) id: number) {
    const stakeholder = UserRole.ESTUDIANTE;
    return this.commonService.listarPorAsesoramiento(id, stakeholder);
  }

  @Get('calendario_asesor/:id')
  listarEventosCalendarioAsesor(@Param('id', ParseIntPipe) id: number) {
    const stakeholder = UserRole.ASESOR;
    return this.commonService.listarPorAsesoramiento(id, stakeholder);
  }

  @Get('allEventosAsesor/:fecha/:id_asesor')
  listarTodosEventos(
    @Param('fecha') fecha: string,
    @Param('id_asesor', ParseIntPipe) id_asesor: number,
  ) {
    const stakeholder = UserRole.ASESOR;
    return this.commonService.listarTodoEventosAsesor(
      fecha,
      id_asesor,
      stakeholder,
    );
  }
}
