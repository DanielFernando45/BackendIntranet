import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Tutorial } from "../entities/tutorial.entity";
import { Repository } from "typeorm";
import { CreateTutorialDto } from "../dto/tutorial-dto/create-tutorial.dto";
import { UpdateTutorialDto } from "../dto/tutorial-dto/update-tutorial.dto";

@Injectable()
export class TutorialesService{
    constructor(
        @InjectRepository(Tutorial)
        private tutorialRepo:Repository<Tutorial>
    ){}

    async postTutorial(body:CreateTutorialDto){
        const newTutorial=this.tutorialRepo.create(body)
        await this.tutorialRepo.save(newTutorial)

        return "Agregado satisfactoriamente"
    }

    async patchTutorial(id:number,body:UpdateTutorialDto){
        const updatedTutorial=await this.tutorialRepo.update(id,body)
        if(updatedTutorial.affected===0)throw new BadRequestException("No se actualizo ningun registro")
        return {"message":`Se actualizaron satisfactoriamente ${updatedTutorial.affected}`}
    }

    async deleteTutorial(id:number){
        const deletedTutorial=await this.tutorialRepo.delete({id})
        if(deletedTutorial.affected===0)throw new BadRequestException("No se elimino ninguna guia")
        return {"message":`Se elimno satisfactoriamente el tutorial con id: ${id}`}
    }

    async listTutorial(){
        const listTutorial=await this.tutorialRepo.find()
        if(listTutorial.length===0)throw new NotFoundException("No se encontraron registros")
        return listTutorial
    }

    async listOneTutorial(id:number){
        const tutorial=await this.tutorialRepo.findOneBy({id})
        if(!tutorial)throw new NotFoundException(`No se encontro una guia con el id: ${id}`)
        return tutorial
    }
}