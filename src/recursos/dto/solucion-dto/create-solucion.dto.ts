import { IsNotEmpty, IsString } from "class-validator";

export class CreateSolucionDto{
    @IsNotEmpty()
    @IsString()
    preguntas:string;

    @IsNotEmpty()
    @IsString()
    respuestas:string
}