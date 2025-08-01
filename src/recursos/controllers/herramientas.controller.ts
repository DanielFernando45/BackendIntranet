import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { HerramientasService } from "../services/herramientas.service";
import { CreateHerramientaDto } from "../dto/herramientas-dto/create-herramientas.dto";
import { UpdateHerramientasDto } from "../dto/herramientas-dto/update-herramientas.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { fileFilter } from "../helper/fileFilter.helper";


@Controller('recursos/herramientas')
export class HerramientasController{
    constructor(private herramientaService:HerramientasService){}
    
        @Post('add')
        @UseInterceptors(FileInterceptor('url_imagen',{
                fileFilter:fileFilter,
                limits:{
                    fileSize:1024*1025*10
                }
        }))
        añadirHerramientas(@Body() body:CreateHerramientaDto,@UploadedFile() file:Express.Multer.File){
            return this.herramientaService.postHerramienta(body,file)
        }
    
        @Patch('update/:id')
        @UseInterceptors(FileInterceptor('url_imagen',{
                fileFilter:fileFilter,
                limits:{
                    fileSize:1024*1025*10
                }
        }))
        actualizarHerramientas(@Param('id',ParseIntPipe) id:number,@Body() body:UpdateHerramientasDto,@UploadedFile() file: Express.Multer.File){
            return this.herramientaService.patchHerramienta(id,body,file)
        }
        
        @Delete('delete/:id')
        deleteHerramientas(@Param('id',ParseIntPipe) id:number){
            return this.herramientaService.deleteHerramienta(id)
        }
    
        @Get('all')
        getHerramientas(){
            return this.herramientaService.listHerramientas()
        }
    
        @Get('list/:id')
        getOneHerramienta(@Param('id',ParseIntPipe) id:number){
            return this.herramientaService.listOneHerramienta(id)
        }
}