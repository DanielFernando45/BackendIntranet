import { IsDateString, IsNotEmpty, IsNumber, IsString } from "class-validator";


export class ClientesSinAsignar{
    @IsNotEmpty()
    @IsNumber()
    id:number;

    @IsNotEmpty()
    @IsString()
    nombre:string;
    
    @IsNotEmpty()
    @IsString()
    apellido:string;

    @IsNotEmpty()
    @IsString()
    gradoAcademico:string;

    @IsDateString()
    @IsNotEmpty()
    fecha_creacion:Date;

    @IsNotEmpty()
    @IsString()
    carrera:string;
}