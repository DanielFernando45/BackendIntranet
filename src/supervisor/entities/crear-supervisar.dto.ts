import { IsEmail, IsNotEmpty, IsString } from "class-validator";


export class CrearSupervisarDto {

    @IsString()
    @IsNotEmpty()
    readonly nombre:string;

    @IsEmail()
    @IsNotEmpty()
    readonly email:string;

    @IsString()
    @IsNotEmpty()
    readonly cable:string;

}