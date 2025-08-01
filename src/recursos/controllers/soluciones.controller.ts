import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { SolucionesService } from "../services/soluciones.service";
import { CreateSolucionDto } from "../dto/solucion-dto/create-solucion.dto";
import { UpdateSolucionDto } from "../dto/solucion-dto/update-solucion-dto";


@Controller('recursos/soluciones')
export class SolucionesController{
    constructor(private solucionesService:SolucionesService){}
    
        @Get('all')
        listarTodo(){
            return this.solucionesService.findAll()
        }
    
        @Post('add')
        añadir(@Body() body:CreateSolucionDto){
            return this.solucionesService.create(body)
        }
    
        @Patch('update/:id')
        update(@Param('id',ParseIntPipe) id:number,@Body() body:UpdateSolucionDto){
            return this.solucionesService.update(id,body)
        }
    
        @Delete('delete/:id')
        deleteNoticia(@Param('id',ParseIntPipe) id:number){
            return this.solucionesService.delete(id)
        }
    
        @Get('list/:id')
        listarUno(@Param('id',ParseIntPipe) id:number){
            return this.solucionesService.listOne(id)
        }
}