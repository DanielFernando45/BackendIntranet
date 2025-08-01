import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { GuiasService } from "../services/guias.service";
import { CreateGuiaDto } from "../dto/guias-dto/create-guia.dto";
import { UpdateGuiaDto } from '../dto/guias-dto/update-guia.dto';
import { FileFieldsInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { fileFilter } from '../helper/fileFilter.helper';


@Controller('recursos/guias')
export class GuiasController{
    constructor(private guiaService:GuiasService){}

    @Post('add')
    @UseInterceptors(FileFieldsInterceptor([
        {name:'url_imagen',maxCount:1},
        {name:'doc_url',maxCount:1}    
    ],{
        fileFilter:fileFilter,
        limits:{
            fileSize:1024*1025*10
        }
    })
    )
    async añadirGuias(@UploadedFiles() files:{
        url_imagen:Express.Multer.File[];
        doc_url:Express.Multer.File[];
    },
    @Body() body:CreateGuiaDto){
        const response=await this.guiaService.postGuia(files,body)
        return response
    }




    @Patch('update/:id')
    @UseInterceptors(FileFieldsInterceptor([
        {name:'url_imagen',maxCount:1},
        {name:'doc_url',maxCount:1}    
    ],{
        fileFilter:fileFilter,
        limits:{
            fileSize:1024*1025*10
        }
    }))
    actualizarGuias(@Param('id',ParseIntPipe) id:number,@Body() body:UpdateGuiaDto,@UploadedFiles() files:{
        url_imagen?:Express.Multer.File[];
        doc_url?:Express.Multer.File[]
    }){
        return this.guiaService.patchGuia(id,body,files)
    }
    



    @Delete('delete/:id')
    deleteGuia(@Param('id',ParseIntPipe) id:number){
        return this.guiaService.deleteGuia(id)
    }

    @Get('all')
    getGuias(){
        return this.guiaService.listGuias()
    }

    @Get('list/:id')
    getOneguia(@Param('id',ParseIntPipe) id:number){
        return this.guiaService.listOneGuia(id)
    }

}