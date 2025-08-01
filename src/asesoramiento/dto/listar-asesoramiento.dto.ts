import { Type } from "class-transformer";
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Tipo_Servicio } from "../entities/asesoramiento.entity";


export class listarAsesoramientoDto {
    @IsNumber()
    @IsNotEmpty()
    id_asesoramiento:number;
    
    @IsString()
    @IsOptional()
    profesionAsesoramiento:string;

    @IsString()
    @IsOptional()
    especialidad:string;

    @IsEnum(Tipo_Servicio)
    tipo_servicio:Tipo_Servicio;
    
    @IsInt()
    @IsNotEmpty()
    tipoContrato:number;
    
    @IsInt()
    @IsNotEmpty()
    tipoTrabajo:number;

    @IsDate()
    @IsNotEmpty()
    @Type(() => Date)
    fecha_inicio:Date;

    @IsDate()
    @IsNotEmpty()
    @Type(() => Date)
    fecha_fin:Date
}
