import { IsDate, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Estado_asunto } from "../entities/asunto.entity";
import { Subido } from "src/documentos/entities/documento.entity";

export class CreateAsuntoDto {

    @IsString()
    titulo:string;

    @IsEnum(Subido)
    subido_por:Subido;

    @IsOptional()
    @IsDate()
    fecha_revision:Date;

    @IsOptional()
    @IsDate()
    fecha_entrega:Date;
}
