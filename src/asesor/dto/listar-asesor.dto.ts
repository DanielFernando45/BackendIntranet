import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class listarAsesorDto{
    @IsNumber()
    @IsNotEmpty()
    readonly id:number;

    @IsString()
    @IsNotEmpty()
    readonly dni:string;
    
    @IsString()
    @IsNotEmpty()
    readonly nombre:string;

    @IsString()
    @IsNotEmpty()
    readonly apellido:string;

    @IsEmail()
    @IsOptional()
    readonly email:string;

    @IsNumber()
    @IsOptional()
    readonly telefono:number;

    @IsString()
    @IsOptional()
    readonly url_imagen:string;

    @IsNotEmpty()
    readonly area:object;

    @IsString()
    readonly especialidad:string;

    @IsNotEmpty()
    readonly gradoAcademico:object;

    @IsString()
    readonly universidad:string;
}