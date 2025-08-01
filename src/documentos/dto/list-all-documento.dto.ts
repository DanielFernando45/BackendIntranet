import { IsDate, IsEnum, IsNotEmpty, IsString } from "class-validator"
import { Estado_asunto } from "src/asuntos/entities/asunto.entity";

export class listAllDocumento{
    @IsString()
    @IsNotEmpty()
    nombre:string;

    @IsString()
    @IsNotEmpty()
    asunto:string;

    @IsEnum(Estado_asunto)
    @IsNotEmpty()
    estado:Estado_asunto;

    @IsDate()
    @IsNotEmpty()
    fecha_subido:Date;

    @IsString()
    @IsNotEmpty()
    ruta:string
}                                                                                                                                                        