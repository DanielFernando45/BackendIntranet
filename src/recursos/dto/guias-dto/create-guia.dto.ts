import { IsNotEmpty, IsString } from "class-validator";

export class CreateGuiaDto{
    @IsNotEmpty()
    @IsString()
    titulo:string;

    @IsNotEmpty()
    @IsString()
    descripcion:string;

    // @IsNotEmpty()
    // @IsString()
    // url_imagen:string;

    // @IsNotEmpty()
    // @IsString()
    // doc_url:string
}