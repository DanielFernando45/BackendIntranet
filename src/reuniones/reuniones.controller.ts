import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  ParseIntPipe,
  Res,
  Query,
  HttpCode,
} from '@nestjs/common';
import { ReunionesService } from './reuniones.service';
import { CreateReunionDto } from './dto/create-reunion.dto';
import { Response } from 'express';
import { ZoomMeetingService } from './zoom.meeting.service';
import { Estado_reunion } from './entities/reunion.entity';

@Controller('reuniones')
export class ReunionesController {
  constructor(
    private readonly reunionesService: ReunionesService,
    private readonly zoomService: ZoomMeetingService,
  ) {}

  @Post('crear-reunion')
  async crearReunion(@Body() body: CreateReunionDto) {
    const reunion = await this.reunionesService.addReunion(body);

    return {
      message: 'Reunion creada correctamente',
      reunion,
    };
  }

  @Delete('eliminar-reunion/:id')
  async createReunion(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { id_asesor: number },
  ) {
    const eliminated = await this.reunionesService.deleteReunion(
      id,
      body.id_asesor,
    );
    return {
      message: `${eliminated}`,
    };
  }

  @Post('webhook')
  @HttpCode(200)
  async handleZoomWebHook(
    @Body() body: any,
    @Headers() headers: any,
    @Res() res: Response,
  ) {
    const event = body.event;
    console.log(`📩 Evento recibido: ${event}`);
    switch (event) {
      case 'endpoint.url_validation': {
        const plainToken = body.payload?.plainToken;
        const encryptedToken = Buffer.from(plainToken).toString('base64');

        return res
          .status(200)
          .setHeader('Content-Type', 'application/json')
          .json({ plainToken, encryptedToken });
      }

      case 'meeting.ended':
        await this.reunionesService.handleMeetingEnded(body);
        break;

      case 'recording.completed':
        await this.reunionesService.handleRecordingCompleted(body);
        break;

      default:
        console.log(`📨 Evento no manejado: ${event}`);
    }

    return { status: 'ok' };
  }

  @Get('/espera/:id')
  listReunionesEspera(@Param('id', ParseIntPipe) id: number) {
    return this.reunionesService.listEspera(id);
  }

  @Get('/terminados/:id')
  listReunionesTerminados(@Param('id', ParseIntPipe) id: number) {
    return this.reunionesService.listTerminados(id);
  }

  @Get('allReunionesProximas/:id')
  allReunionesProximas(@Param('id', ParseIntPipe) id: number) {
    const estado = Estado_reunion.ESPERA;
    return this.reunionesService.listReunionesByAsesor(id, estado);
  }

  @Get('allReunionesAnteriores/:id')
  allReunionesAnteriores(@Param('id', ParseIntPipe) id: number) {
    const estado = Estado_reunion.TERMINADO;
    return this.reunionesService.listReunionesByAsesor(id, estado);
  }

  @Get('zoom')
  redirectZoom(@Query('link') link: string, @Res() res: Response) {
    res.redirect(`${link}`);
  }
}
