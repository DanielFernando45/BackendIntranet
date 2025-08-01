import { IsNotEmpty, IsString } from 'class-validator';

export class CreateHerramientaDto {
    @IsNotEmpty()
    @IsString()
    nombre: string;

    @IsNotEmpty()
    @IsString()
    descripcion: string;

    // @IsNotEmpty()
    // @IsString()
    // url_imagen: string;

    @IsNotEmpty()
    @IsString()
    enlace: string;
}