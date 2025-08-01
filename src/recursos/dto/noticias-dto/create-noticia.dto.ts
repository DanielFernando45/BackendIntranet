import { IsNotEmpty, IsString } from "class-validator";

export class CreateNoticiaDto{
    @IsNotEmpty()
    @IsString()
    titulo:string;

    @IsNotEmpty()
    @IsString()
    descripcion:string;

    // @IsNotEmpty()
    // @IsString()
    // url_imagen:string
}