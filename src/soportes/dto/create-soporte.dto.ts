import { IsEnum, IsInt, isNotEmpty, IsNotEmpty, IsString, IsDateString, IsNumber } from 'class-validator';
import { AsuntoError, AsuntoEstado } from "../entities/soporte.entity";

export class CreateSoporteDto {
    @IsNotEmpty()
    @IsEnum(AsuntoError)
    asunto:AsuntoError;

    @IsNotEmpty()
    @IsString()
    descripcion:string;
    
    // @IsNotEmpty()
    // @IsEnum(AsuntoEstado)
    // estado:AsuntoEstado;

    // @IsNotEmpty()
    // @IsDateString()
    // fecha_envio:Date;


    @IsNotEmpty()
    @IsNumber()
    id_cliente:number;
}