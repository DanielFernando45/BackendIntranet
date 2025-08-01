import { InjectRepository } from "@nestjs/typeorm";
import { Solucion } from "../entities/solucion.entity";
import { Repository } from "typeorm";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateSolucionDto } from "../dto/solucion-dto/create-solucion.dto";
import { UpdateSolucionDto } from "../dto/solucion-dto/update-solucion-dto";

@Injectable()
export class SolucionesService{
    constructor(
            @InjectRepository(Solucion)
            private solucionRepo:Repository<Solucion>
        ){}
    
        async findAll(){
            const listaNoticias=await this.solucionRepo.find()
            if(listaNoticias.length===0)throw new NotFoundException("No se encontro")
    
            return listaNoticias
        }
    
        async create(body:CreateSolucionDto){
            const newSolucion=this.solucionRepo.create(body)
            await this.solucionRepo.save(newSolucion)
    
            return "Agregado correctamente"
        }
    
        async update(id:number,body:UpdateSolucionDto){
            const updated=await this.solucionRepo.update({id},{...body})
            if(updated.affected===0)throw new NotFoundException("No se modifico nada")
    
            return `Se modifico correctamente el registro con id : ${id}`
        }
    
        async delete(id:number){
            const deleted=await this.solucionRepo.delete(id)
            if(deleted.affected===0)throw new BadRequestException("No se elimino ningun registro")
            
            return `Se elimino correctamente el registro con id: ${id}`
        }
    
        async listOne(id:number){
            try{
                const oneNoticia=await this.solucionRepo.findOneByOrFail({id})
                return oneNoticia
            }catch(err){
                throw new BadRequestException("No se encuentra el registro con id: "+id)
            }
        }
}