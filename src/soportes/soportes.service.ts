import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateSoporteDto } from './dto/create-soporte.dto';
import { UpdateSoporteDto } from './dto/update-soporte.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Soporte, AsuntoEstado } from './entities/soporte.entity';
import { Repository } from 'typeorm';
import { ClienteService } from 'src/cliente/cliente.service';

@Injectable()
export class SoportesService {
  constructor(
    private readonly clienteService:ClienteService,
    
    @InjectRepository(Soporte)
    private soporteRepo:Repository<Soporte>
  ){}
  async create(createSoporteDto: CreateSoporteDto) {
    const newSoporte=this.soporteRepo.create({...createSoporteDto,cliente:{id:createSoporteDto.id_cliente},estado:AsuntoEstado.ESPERA,fecha_envio:new Date()})
    await this.soporteRepo.save(newSoporte)
    return 'Se agrego correctamente';
  }
  
  async findByEstado(estado_asunto:AsuntoEstado) {
    const listaSoporte=await this.soporteRepo.find({where:{estado:estado_asunto},relations:['cliente']})
    if(listaSoporte.length===0)throw new NotFoundException("No se encontraron formularios con ese estado")
    
    const listaFinal=listaSoporte.map((support)=>{
      //const delegado=await this.clienteService.getDelegado(support.asesoramiento.id)
      return({
        "id_soporte":support.id,
        "asunto":support.asunto,
        "descripcion":support.descripcion,
        "fecha_envio":support.fecha_envio,
        "fecha_revision":support.fecha_revision,
        "cliente":`${support.cliente.nombre} ${support.cliente.apellido}`
      })
    })
    return listaFinal;
  }
  
  async findOne(id: number) {
    const oneSoporte=await this.soporteRepo.findOneByOrFail({id})
      .catch(()=>{
        return new BadRequestException("No hay con ese ID")
      })
    return oneSoporte;
  }
  
  async update(id: number, updateSoporteDto: UpdateSoporteDto) {
    return `This action updates a #${id} soporte`;
  }

  async changeToFinished(id:number){
    const changed=await this.soporteRepo.findOneByOrFail({id})
      .catch(()=>{
        throw new BadRequestException("El asunto no fue encontrado")
      })
  
    if(changed.estado!==AsuntoEstado.ESPERA)throw new BadRequestException("Este asunto ya esta finalizado")
    changed.estado=AsuntoEstado.FINALIZADO
    changed.fecha_revision=new Date()
  
    await this.soporteRepo.save(changed)
  
    return "Se finalizo correctamente"
  }
  
  async remove(id: number) {
    try{
    const deleted=await this.soporteRepo.findOneByOrFail({id})
    await this.soporteRepo.delete({id})
    return `Se removio el soporte con id #${id}`;
    }catch(err){
      return new BadRequestException(`No se encuentra soporte con ese ID`)
    }
  }
}
