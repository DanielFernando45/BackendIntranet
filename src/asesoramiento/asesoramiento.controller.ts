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
import { AsesoramientoService } from './asesoramiento.service';
import {
  AsesoramientoUpdateWrpDTO,
  AsesoramientoWrpDTO,
} from './dto/asesoramientoadd.wrpdto';
import { FechasValuePipe } from 'src/common/pipes/parse-fecha.pipe';
import { Estado_Asesoria } from './entities/asesoramiento.entity';

@Controller('asesoramiento')
export class AsesoramientoController {
  constructor(private readonly asesoramientoService: AsesoramientoService) {}

  @Get('/listar')
  listar() {
    return this.asesoramientoService.listar();
  }

  @Get('cuotasSinPagos')
  listarCuotasSinpagos() {
    const tipo_contrato = 'cuotas';
    return this.asesoramientoService.listAsesoriasSinpagos(tipo_contrato);
  }

  @Get('contadoSinPagos')
  listarContadosSinPagos() {
    const tipo_contrato = 'contado';
    return this.asesoramientoService.listAsesoriasSinpagos(tipo_contrato);
  }

  @Get('delegadosToServicios')
  listarDelegadosToServicios() {
    return this.asesoramientoService.listDelegadoToServicios();
  }

  @Get('/listar/:id')
  listar_por_ID(@Param('id', ParseIntPipe) id: number) {
    return this.asesoramientoService.listar_por_id(id);
  }

  
  @Get('verInduccion/:id')
  getVerInduccionCliente(@Param('id', ParseIntPipe) id:number){
    return this.asesoramientoService.getVerInduccionCliente(id);
  }  

  @Get('/listarAsignados')
  listarAsignados(){
    return this.asesoramientoService.listarAsignados();
  }

  //falta terminar esta API , primero deberia crearse la asignacion supervisor , asesor-cliente
  @Get('listarContratosSinAsignar')
  listarContratosSinAsignar(){
    return this.asesoramientoService.listarContratosSinAsignar();
  }

  @Get('ListarContratosAsignados')
  listarContratosAsignados(){
    return this.asesoramientoService.listarContratosAsignados();
  }


  
  @Post('asignacion')
  create(@Body() body: AsesoramientoWrpDTO) {
    return this.asesoramientoService.create(
      body.createAsesoramiento,
      body.clientes,
    );
  }

  @Get('filtrar/:fecha')
  buscar_por_fecha(@Param('fecha', FechasValuePipe) fecha: Date) {
    return this.asesoramientoService.listar_segun_fecha(fecha);
  }

  // @Patch("update/:id")
  // editar_asesor(@Param("id",ParseIntPipe) id:number,@Body() campos:UpdateAsesoramientoDto){
  //   this.asesoramientoService.changeAsesoramiento(id,campos)
  // }

  @Patch('update/:id')
  updateAsesor(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AsesoramientoUpdateWrpDTO,
  ) {
    return this.asesoramientoService.update(
      id,
      body.createAsesoramiento,
      body.clientes,
    );
  }

  @Patch('estado/:id')
  desactivateAsesoria(@Param('id', ParseIntPipe) id: number) {
    return this.asesoramientoService.changeState(id);
  }

  @Delete('delete/:id')
  finalizado(@Param('id', ParseIntPipe) id: number) {
    return this.asesoramientoService.remove(id);
  }

  @Get('misAsesoriasActivas/:id')
  gestionAsesoria(@Param('id', ParseIntPipe) id: number) {
    const estado = Estado_Asesoria.ACTIVO;
    return this.asesoramientoService.gestionAsesorias(id, estado);
  }

  @Get('misAsesoriasInactivas/:id')
  asesoriaDesactivadas(@Param('id', ParseIntPipe) id: number) {
    const estado = Estado_Asesoria.DESACTIVADO;
    return this.asesoramientoService.gestionAsesorias(id, estado);
  }

  @Get('vencimiento/:id')
  fechaVencimiento(@Param('id', ParseIntPipe) id: number) {
    return this.asesoramientoService.fecha_vencimiento_contrato(id);
  }
}
