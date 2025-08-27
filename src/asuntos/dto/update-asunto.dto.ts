import { PartialType } from '@nestjs/mapped-types';
import { CreateAsuntoDto } from './create-asunto.dto';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Subido } from 'src/documentos/entities/documento.entity';
import { Type } from 'class-transformer';

export class UpdateAsuntoDto extends PartialType(CreateAsuntoDto) {

    @IsString()
    @IsNotEmpty()
    titulo: string;

    @IsString()
    idsElminar: string;

    @IsNumber()
    @Type(() => Number)
    idAsesoramiento: number;

    @IsEnum(Subido)
    subido_por: Subido;
}
