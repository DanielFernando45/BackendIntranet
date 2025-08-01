import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Noticia } from "../entities/noticia.entity";
import { Repository } from "typeorm";
import { CreateNoticiaDto } from "../dto/noticias-dto/create-noticia.dto";
import { UpdateNoticiaDto } from "../dto/noticias-dto/update-noticia.dto";
import { BackbazeService } from "src/backblaze/backblaze.service";
import { DIRECTORIOS } from "src/backblaze/directorios.enum";


@Injectable()
export class NoticiasService{
    constructor(
        private readonly backBlazeService:BackbazeService,

        @InjectRepository(Noticia)
        private noticiaRepo:Repository<Noticia>
    ){}

    async findAll(){
        const listNoticias=await this.noticiaRepo.find()
            if(listNoticias.length===0)throw new NotFoundException("No se encontraron registros")
    
            const responsenoticias=Promise.all(listNoticias.map(async(noticia)=>{
                const linkImagen=await this.backBlazeService.getSignedUrl(noticia.url_imagen)
    
            return({
                "id":noticia.id,
                "titulo":noticia.titulo,
                "descripcion":noticia.descripcion,
                "url_imagen":noticia.url_imagen,
                "imagen":linkImagen,
            })
        }))
        return responsenoticias
    }

    async create(body:CreateNoticiaDto,file:Express.Multer.File){
        const url_imagen=await this.backBlazeService.uploadFile(file,DIRECTORIOS.NOTICIAS)
        const newNoticia=this.noticiaRepo.create({...body,url_imagen})
        await this.noticiaRepo.save(newNoticia)
        return {message:"Agregado satisfactoriamente",
            imagen_url:url_imagen
        }
    }

    async update(id:number,body:UpdateNoticiaDto,file:Express.Multer.File){
        const updated=await this.noticiaRepo.findOneBy({id})
        if(!updated)throw new NotFoundException("No se encontro noticia con ese id")
        if(file){
            updated.url_imagen=await this.backBlazeService.uploadFile(file,DIRECTORIOS.NOTICIAS)
        }
        Object.assign(updated,body)
        await this.noticiaRepo.save(updated)
        return `Se modifico correctamente la noticia con id : ${id}`
    }

    async delete(id:number){
        const deleted=await this.noticiaRepo.findOneBy({id})
        if(!deleted)throw new BadRequestException("No se encontro esa noticia")
        await this.backBlazeService.deleteFile(deleted.url_imagen)
        await this.noticiaRepo.delete(deleted)
        
        return {mensaje:`herramienta eliminada correctamente con id: ${id}`}
    }

    async listOne(id:number){
        const noticia=await this.noticiaRepo.findOneBy({id})
        if(!noticia)throw new NotFoundException(`No se encontro una herramienta con el id: ${id}`)
        const imagen=await this.backBlazeService.getSignedUrl(noticia.url_imagen)
        Object.assign(noticia,{imagen})
        return noticia
    }
}