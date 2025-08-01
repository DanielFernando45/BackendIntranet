import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { TutorialesService } from "../services/tutoriales.service";
import { CreateTutorialDto } from "../dto/tutorial-dto/create-tutorial.dto";
import { UpdateTutorialDto } from "../dto/tutorial-dto/update-tutorial.dto";


@Controller('recursos/tutoriales')
export class TutorialesController{
    constructor(private tutorialesService:TutorialesService){}

    @Post('add')
    añadirGuias(@Body() body:CreateTutorialDto){
        return this.tutorialesService.postTutorial(body)
    }

    @Patch('update/:id')
    actualizarGuias(@Param('id',ParseIntPipe) id:number,@Body() body:UpdateTutorialDto){
        return this.tutorialesService.patchTutorial(id,body)
    }
    
    @Delete('delete/:id')
    deleteGuia(@Param('id',ParseIntPipe) id:number){
        return this.tutorialesService.deleteTutorial(id)
    }

    @Get('all')
    getGuias(){
        return this.tutorialesService.listTutorial()
    }

    @Get('list/:id')
    getOneguia(@Param('id',ParseIntPipe) id:number){
        return this.tutorialesService.listOneTutorial(id)
    }
}