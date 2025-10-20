import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Post,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificacionesService } from './notificacion.service';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notiService: NotificacionesService) {}

  @Patch(':id/leida')
  async marcarNotificacionComoLeida(@Param('id') id: number) {
    return this.notiService.marcarComoLeida(id);
  }
  // 🔹 Enviadas por cliente
  @Get('enviadas/cliente/:idCliente')
  async getEnviadasPorCliente(@Param('idCliente') idCliente: number) {
    return this.notiService.obtenerNotificacionesEnviadasPorCliente(idCliente);
  }

  // 🔹 Enviadas por asesor
  @Get('enviadas/asesor/:idAsesor')
  async getEnviadasPorAsesor(@Param('idAsesor') idAsesor: number) {
    return this.notiService.obtenerNotificacionesEnviadasPorAsesor(idAsesor);
  }

  @Post()
  async crearNotificacionManual(
    @Body()
    body: {
      idClienteReceptor?: number;
      idAsesorReceptor?: number;
      idClienteEmisor?: number;
      idAsesorEmisor?: number;
      idContrato: string;
      mensaje: string;
      tipo: string;
    },
  ) {
    const saved = await this.notiService.crearNotificacionUnica(body);
    return { message: 'Notificación creada correctamente', noti: saved };
  }
}
