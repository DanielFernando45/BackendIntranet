import {
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateContratoDto {
  @IsOptional()
  @IsString()
  servicio?: string;

  @IsOptional()
  @IsString()
  modalidad?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  idTipoTrabajo?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  idTipoPago?: number;

  @IsOptional()
  @IsUUID()
  idCategoria?: string;

  @IsOptional()
  @IsString()
  documentos?: string;
  
  @IsOptional()
  @IsDateString()
  fechaInicio?: string; // ISO string, ej: "2025-09-15T18:30:00.000Z"

  @IsOptional()
  @IsDateString()
  fechaFin?: string; // ISO string
}
