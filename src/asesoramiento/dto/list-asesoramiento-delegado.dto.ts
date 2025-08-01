import { IsDateString, IsInt, IsNotEmpty, IsString } from "class-validator";

export class listAsesoramientoYDelegadoDto{
    @IsNotEmpty()
    @IsInt()
    id_asesoramiento:number;
    
    @IsNotEmpty()
    @IsString()
    delegado?:string;

    @IsNotEmpty()
    @IsString()
    tipo_contrato:string;

    @IsNotEmpty()
    @IsString()
    tipo_trabajo:string;

    @IsNotEmpty()
    @IsString()
    profesion_asesoria:string
}