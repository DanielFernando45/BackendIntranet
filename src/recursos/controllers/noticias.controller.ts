import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { NoticiasService } from "../services/noticias.service";
import { CreateNoticiaDto } from "../dto/noticias-dto/create-noticia.dto";
import { UpdateNoticiaDto } from "../dto/noticias-dto/update-noticia.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { fileFilter } from "../helper/fileFilter.helper";

@Controller('recursos/noticias')
export class NoticiasController{
    constructor(private noticiasService:NoticiasService){}

    @Get('all')
    listarTodo(){
        return this.noticiasService.findAll()
    }

    @Post('add')
    @UseInterceptors(FileInterceptor('url_imagen',{
        fileFilter:fileFilter,
        limits:{
            fileSize:1024*1025*10
        }
    }))
    añadir(@Body() body:CreateNoticiaDto,@UploadedFile() file:Express.Multer.File){
        return this.noticiasService.create(body,file)
    }

    @Patch('update/:id')
    @UseInterceptors(FileInterceptor('url_imagen',{
        fileFilter:fileFilter,
        limits:{
            fileSize:1024*1025*10
        }
    }))
    update(@Param('id',ParseIntPipe) id:number,@Body() body:UpdateNoticiaDto,@UploadedFile() file:Express.Multer.File){
        return this.noticiasService.update(id,body,file)
    }

    @Delete('delete/:id')
    deleteNoticia(@Param('id',ParseIntPipe) id:number){
        return this.noticiasService.delete(id)
    }

    @Get('list/:id')
    listarUno(@Param('id',ParseIntPipe) id:number){
        return this.noticiasService.listOne(id)
    }
}