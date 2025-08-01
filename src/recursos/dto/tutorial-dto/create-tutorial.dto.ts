import { IsNotEmpty, IsString } from "class-validator";

export class CreateTutorialDto{
    @IsNotEmpty()
    @IsString()
    titulo:string;

    @IsNotEmpty()
    @IsString()
    enlace:string
}