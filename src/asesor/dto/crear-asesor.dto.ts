import { IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";


export class createAsesorDto{
    @IsString()
    @IsNotEmpty()
    readonly dni:string
    
    @IsString()
    @IsNotEmpty()
    readonly nombre:string;

    @IsString()
    @IsNotEmpty()
    readonly apellido:string;

    @IsEmail()
    @IsNotEmpty()
    readonly email:string;

    @IsNumber()
    readonly telefono:number;

    @IsString()
    readonly url_imagen:string;

    @IsString()
    readonly area: string;

    @IsString()
    readonly especialidad:string;

    @IsNumber()
    readonly gradoAcademico:number;

    @IsString()
    readonly universidad:string;
}