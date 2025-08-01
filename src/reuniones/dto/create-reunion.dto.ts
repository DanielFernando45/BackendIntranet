import { IsDateString, IsEnum, IsIn, IsInt, IsISO8601, isNotEmpty, IsNotEmpty, IsString } from "class-validator";
import { Estado_reunion } from "../entities/reunion.entity";

export class CreateReunionDto {
    @IsString()
    @IsNotEmpty()
    titulo:string;

    @IsISO8601({strict:true})
    @IsNotEmpty()
    fecha_reunion:Date;

    @IsInt()
    @IsNotEmpty()
    id_asesoramiento:number;

    @IsInt()
    @IsNotEmpty()
    id_asesor:number

    // @IsString()
    // @IsNotEmpty()
    // enlace_zoom:string
    
}
