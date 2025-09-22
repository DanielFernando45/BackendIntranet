import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Subido } from 'src/documentos/entities/documento.entity';
import { PartialType } from '@nestjs/mapped-types';
import { CreateAsuntoDto } from './create-asunto.dto';

export class UpdateAsuntoDto extends PartialType(CreateAsuntoDto) {
  @IsString()
  @IsNotEmpty()
  titulo: string;
  
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') {
      try {
        return JSON.parse(value).map((v: any) => Number(v));
      } catch {
        return [];
      }
    }
    return value;
  })
  idsElminar?: number[];

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  idAsesoramiento?: number;

  @IsEnum(Subido)
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  subido_por?: Subido;
}
