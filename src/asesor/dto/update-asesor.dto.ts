import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class UpdateAsesorDto{
    @IsString()
    @IsOptional()
    readonly dni:string
    
    @IsString()
    @IsOptional()
    readonly nombre:string;

    @IsString()
    @IsOptional()
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

    @IsString()
    @IsOptional()
    readonly area:string;

    @IsString()
    @IsOptional()
    readonly especialidad:string;

    @IsNumber()
    @IsOptional()
    readonly gradoAcademico:string;

    @IsString()
    @IsOptional()
    readonly universidad:string;
}