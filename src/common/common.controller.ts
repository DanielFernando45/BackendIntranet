import { Controller, Get, Param, ParseDatePipe, ParseIntPipe } from "@nestjs/common";
import { CommonService } from './common.service';
import { UserRole } from "src/usuario/usuario.entity";


@Controller('common')
export class CommonController{
    constructor (private readonly commonService:CommonService){}

    @Get("listar-trabajos")
    async listTrabajos(){
        return this.commonService.listarTiposTrabajo()
    }
// 
    @Get("listar-tipoContratos")
    async listarContratos(){
        return this.commonService.listarTipoContratos()
    }

    @Get('calendario_estudiante/:id/:fecha')
    listarEventosCalendario(@Param('id',ParseIntPipe) id:number,@Param('fecha') fecha:string){
        const stakeholder=UserRole.ESTUDIANTE
        return this.commonService.listarSegunFecha(id,fecha,stakeholder)
    }

    @Get('calendario_asesor/:id/:fecha')
    listarEventosAsesor(@Param('id',ParseIntPipe) id:number,@Param('fecha') fecha:string){
        const stakeholder=UserRole.ASESOR
        return this.commonService.listarSegunFecha(id,fecha,stakeholder)
    }

    @Get('allEventosAsesor/:fecha/:id_asesor')
    listarTodosEventos(@Param('fecha') fecha:string,@Param('id_asesor',ParseIntPipe) id_asesor:number){
        const stakeholder=UserRole.ASESOR
        return this.commonService.listarTodoEventosAsesor(fecha,id_asesor,stakeholder)
    }
}