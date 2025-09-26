import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
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
  @IsOptional()
  titulo: string;

  @IsString()
  @IsOptional()
  titulo_asesor: string;

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
  
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
  fecha_terminado?: string;

  @IsEnum(Subido)
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  subido_por?: Subido;
}
