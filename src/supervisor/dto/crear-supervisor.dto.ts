import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";


export class createSupervisorDto{

    @IsString()
    @IsNotEmpty()
    readonly nombre: string;

    @IsEmail()
    @IsNotEmpty()
    readonly email: string;

    @IsString()
    @IsNotEmpty()
    readonly dni: string;

    @IsArray()
    @IsOptional()
    readonly areasIds?: string[];
}