import { Type } from "class-transformer";
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Tipo_Servicio } from "../entities/asesoramiento.entity";


export class CreateAsesoramientoDto {
    @IsNumber()
    @IsNotEmpty()
    id_asesor:number;

    @IsString()
    @IsOptional()
    profesion_asesoria:string;

    @IsString()
    @IsOptional()
    especialidad:string;

    @IsEnum(Tipo_Servicio)
    @IsNotEmpty()
    tipo_servicio:Tipo_Servicio;
    
    @IsInt()
    @IsNotEmpty()
    id_contrato:number;
    
    @IsInt()
    @IsNotEmpty()
    id_tipo_trabajo:number;

    @IsDate()
    @IsNotEmpty()
    @Type(() => Date)
    fecha_inicio:Date;

    @IsDate()
    @IsNotEmpty()
    @Type(() => Date)
    fecha_fin:Date
}
