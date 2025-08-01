import { BadRequestException, Injectable, NotFoundException, UploadedFile } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Herramienta } from "../entities/herramienta.entity";
import { Repository } from "typeorm";
import { CreateHerramientaDto } from "../dto/herramientas-dto/create-herramientas.dto";
import { UpdateHerramientasDto } from "../dto/herramientas-dto/update-herramientas.dto";
import { BackbazeService } from '../../backblaze/backblaze.service';
import { DIRECTORIOS } from 'src/backblaze/directorios.enum';

@Injectable()
export class HerramientasService{
    constructor(
        private readonly backBlazeService:BackbazeService,

        @InjectRepository(Herramienta)
        private herramientasRepo:Repository<Herramienta>
    ){}
    
    async postHerramienta(body:CreateHerramientaDto,file:Express.Multer.File){
        const url_imagen=await this.backBlazeService.uploadFile(file,DIRECTORIOS.HERRAMIENTAS)
        const newherramienta=this.herramientasRepo.create({...body,url_imagen})
        await this.herramientasRepo.save(newherramienta)
        return {message:"Agregado satisfactoriamente",
            imagen_url:url_imagen
        }
    }

    // async patchHerramienta(id:number,body:UpdateHerramientasDto){
    //     const updatedherramienta=await this.herramientasRepo.update(id,body)
    //     if(updatedherramienta.affected===0)throw new BadRequestException("No se actualizo ningun registro")
    //     return {"message":`Se actualizaron satisfactoriamente ${updatedherramienta.affected}`}
    // }

    // async deleteHerramienta(id:number){
    //     const deletedherramienta=await this.herramientasRepo.delete({id})
    //     if(deletedherramienta.affected===0)throw new BadRequestException("No se elimino ninguna herramienta")
    //     return {"message":`Se elimno satisfactoriamente la herramienta con id: ${id}`}
    // }

    // async listHerramientas(){
    //     const listherramientas=await this.herramientasRepo.find()
    //     if(listherramientas.length===0)throw new NotFoundException("No se encontraron registros")
    //     return listherramientas
    // }

    // async listOneHerramienta(id:number){
    //     const herramienta=await this.herramientasRepo.findOneBy({id})
    //     if(!herramienta)throw new NotFoundException(`No se encontro una herramienta con el id: ${id}`)
    //     return herramienta
    // }

    async patchHerramienta(id:number,body:UpdateHerramientasDto,file:Express.Multer.File){    
            const updatedherramienta=await this.herramientasRepo.findOneBy({id})
            if(!updatedherramienta)throw new BadRequestException("No se actualizo ningun registro")
            Object.assign(updatedherramienta,body)
    

            if(file){
                const response=await this.backBlazeService.uploadFile(file,DIRECTORIOS.HERRAMIENTAS)
                updatedherramienta.url_imagen=response
            }
            await this.herramientasRepo.save(updatedherramienta)
            return {"message":`Se actualizaron satisfactoriamente la herramienta con id:${id}`}
        }
    
       
    
        async listHerramientas(){
            const listherramientas=await this.herramientasRepo.find()
            if(listherramientas.length===0)throw new NotFoundException("No se encontraron registros")
    
            const responseherramientas=Promise.all(listherramientas.map(async(herramienta)=>{
                const linkImagen=await this.backBlazeService.getSignedUrl(herramienta.url_imagen)
    
                return({
                    "id":herramienta.id,
                    "nombre":herramienta.nombre,
                    "descripcion":herramienta.descripcion,
                    "enlace":herramienta.enlace,
                    "url_imagen":herramienta.url_imagen,
                    "imagen":linkImagen,
                })
            }))
    
            return responseherramientas
        }
    
        async listOneHerramienta(id:number){
            const herramienta=await this.herramientasRepo.findOneBy({id})
            if(!herramienta)throw new NotFoundException(`No se encontro una herramienta con el id: ${id}`)
            const imagen=await this.backBlazeService.getSignedUrl(herramienta.url_imagen)
            Object.assign(herramienta,{imagen})
            return herramienta
        }
    
        async deleteHerramienta(id:number){
            const herramienta=await this.herramientasRepo.findOneBy({id})
            if(!herramienta)throw new NotFoundException(`No se encontro la herramienta con ID: ${id}`)
            await this.backBlazeService.deleteFile(herramienta.url_imagen)

            await this.herramientasRepo.delete({id})
    
            return {mensaje:`herramienta eliminada correctamente con id: ${id}`}
        }
}