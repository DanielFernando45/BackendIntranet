import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoAlContadoDto } from './dto/create-pago-al-contado.dto';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common/exceptions';
import { CreatePagoPorCuotaDto } from './dto/create-pago-por-cuotas.dto';
import {
  PagoPorCuotaUpdate,
  PagoPorCuotaWrpDTO,
} from './dto/pago-por-cuotas-add.dto';
import { UpdateCuotasDto } from './dto/cuotas-update.dto';
import { UpdatePagoContadoDto } from './dto/update-pago.dto';
import { tipoPago, tipoServicio } from './entities/informacion_pagos.entity';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Get('pagosCuotas')
  async listarPagosPorCuotas() {
    return await this.pagosService.listarContratosACuotas();
  }

  @Get('pagosContado')
  async listarPagosAlContado() {
    return await this.pagosService.listarContratosAlContado();
  }
  @Post('alContado')
  async añadir_pago_al_contado(@Body() createPagoDto: CreatePagoAlContadoDto) {
    const tipo_servicio = tipoServicio.ASESORIA;
    const response = await this.pagosService.contadoYotrosServicios(
      createPagoDto,
      tipo_servicio,
    );
    return response;
  }

  @Post('porCuotas')
  async añadir_pago_por_cuotas(@Body() createPagoDto: PagoPorCuotaWrpDTO) {
    const { id_asesoramiento } = createPagoDto.createPagoPorCuotas;

    // Validación de 'id_asesoramiento'
    if (!id_asesoramiento || isNaN(id_asesoramiento)) {
      throw new BadRequestException(
        'El id_asesoramiento es obligatorio y debe ser un número válido',
      );
    }

    try {
      // Llamamos al servicio para manejar la lógica de inserción de pagos por cuotas
      const result = await this.pagosService.post_pago_por_cuotas(createPagoDto);
      return { message: result };
    } catch (error) {
      // Si se produce algún error en el servicio, lo gestionamos aquí
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          `Error al realizar el pago por cuotas: ${error.message}`,
        );
      }
    }
  }

  @Post('otrosServicios')
  async añadirOtrosServicios(@Body() addNewService: CreatePagoAlContadoDto) {
    const tipo_servicio = tipoServicio.OTROS;
    const response = await this.pagosService.contadoYotrosServicios(
      addNewService,
      tipo_servicio,
    );
    return response;
  }

  @Patch('updateContado/:id')
  async updateContado(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePagoAlContadoDto: UpdatePagoContadoDto,
  ) {
    return await this.pagosService.updateContado(id, updatePagoAlContadoDto);
  }

  @Patch('updateCuotas/:id')
  async updateCuotas(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePagoDto: UpdateCuotasDto,
  ) {
    return await this.pagosService.updateCuotas(id, updatePagoDto);
  }

  @Patch('updateServicios/:id')
  async updateOtroServicios(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiciosDto: UpdatePagoContadoDto,
  ) {
    return await this.pagosService.updateOtroServicios(id, updateServiciosDto);
  }

  @Get('listServicios')
  async findAllServicios() {
    return this.pagosService.findAllServicios();
  }

  @Get('contado')
  getPagoContado() {
    const tipo = tipoPago.CONTADO;
    console.log('Entrando a /contado');
    return this.pagosService.getPagosByTipo(tipo);
  }

  @Get('cuotas')
  getPagosCuotas() {
    const tipo = tipoPago.CUOTAS;
    console.log('Entrando a /cuotas');
    return this.pagosService.getPagosCuotas(tipo);
  }

  @Get('misAsesorias/:id')
  misPagosAsesorias(@Param('id', ParseIntPipe) id: number) {
    const tipo_servicio = tipoServicio.ASESORIA;
    return this.pagosService.listPagosByAsesoramiento(id, tipo_servicio);
  }

  @Get('misServicios/:id')
  misPagosServicios(@Param('id', ParseIntPipe) id: number) {
    const tipo_servicio = tipoServicio.OTROS;
    return this.pagosService.listPagosByAsesoramiento(id, tipo_servicio);
  }

  @Delete('delete/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pagosService.deletePago(id);
  }
}
