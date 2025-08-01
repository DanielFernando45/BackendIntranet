import { IsNotEmpty, IsString } from "class-validator";

export class archivosDataDto{
    @IsString()
    @IsNotEmpty()
    nombreDocumento:string

    @IsString()
    @IsNotEmpty()
    directorio:string
}