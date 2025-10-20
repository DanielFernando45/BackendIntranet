import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateContratoDto {
  @IsString()
  servicio: string;

  @IsString()
  modalidad: string;

  @IsNumber()
  @Type(() => Number)
  idTipoTrabajo: number; // number

  @IsOptional() // Hacemos estos campos opcionales para que no sean obligatorios
  @IsDateString()
  fechaInicio?: string; // Fecha de inicio

  @IsOptional() // Hacemos estos campos opcionales
  @IsDateString()
  fechaFin?: string; // Fecha de fin
  @IsNumber()
  @Type(() => Number)
  idTipoPago: number; // number
  
  @IsOptional()
  @IsString()
  documentos?: string;

  @IsOptional()
  @IsUUID()
  idCategoria?: string | null; // Opcional, puede ser null
}
